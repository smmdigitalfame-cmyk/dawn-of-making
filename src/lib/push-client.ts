import { getPushPublicKey, savePushSubscription } from "./push.functions";

export type PushStatus = "registered" | "unsupported" | "open-in-new-tab" | "denied" | "no-worker";

function keyToBytes(s: string): Uint8Array<ArrayBuffer> {
  const b = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
}

// Call from a click: browsers require a user gesture for the permission prompt.
export async function enablePhonePush(): Promise<PushStatus> {
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return "unsupported";
  if (window.top !== window.self) return "open-in-new-tab";
  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission !== "granted") return "denied";
  // Wait (up to 10s) for the app worker to become active on first open.
  const reg = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((r) => setTimeout(() => r(null), 10000)),
  ]);
  if (!reg || !reg.active?.scriptURL.endsWith("/sw.js")) return "no-worker";
  const { publicKey } = await getPushPublicKey();
  const sub = (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(publicKey) }));
  const json = sub.toJSON();
  await savePushSubscription({ data: { endpoint: sub.endpoint, p256dh: json.keys?.["p256dh"] ?? "", auth: json.keys?.["auth"] ?? "" } });
  return "registered";
}

export const PUSH_MESSAGES: Record<PushStatus, string> = {
  registered: "Phone notifications are on for this device.",
  unsupported: "This browser does not support phone notifications.",
  "open-in-new-tab": "Open the published app (not the editor preview) to turn on notifications.",
  denied: "Notifications are blocked. Allow them in your browser/app site settings.",
  "no-worker": "Open the installed or published app once, then try again.",
};
