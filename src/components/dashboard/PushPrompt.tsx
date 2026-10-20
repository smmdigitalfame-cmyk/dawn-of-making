import { Bell, X } from "lucide-react";
import { useEffect, useState } from "react";
import { enablePhonePush, PUSH_MESSAGES } from "@/lib/push-client";

const DISMISS_KEY = "dashora-push-prompt-dismissed";

/**
 * One-time banner shown when the app opens, asking to allow phone notifications.
 * Browsers only show the real permission dialog after a tap, so this banner is
 * the gesture that triggers it.
 */
export function PushPrompt() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "default") return;
    if (window.localStorage.getItem(DISMISS_KEY)) return;
    const t = window.setTimeout(() => setVisible(true), 1200);
    return () => window.clearTimeout(t);
  }, []);

  if (!visible) return null;

  async function allow() {
    setBusy(true);
    setMsg(null);
    try {
      const status = await enablePhonePush();
      setMsg(PUSH_MESSAGES[status]);
      if (status === "registered" || status === "denied") {
        window.localStorage.setItem(DISMISS_KEY, "1");
        window.setTimeout(() => setVisible(false), 1800);
      }
    } catch {
      setMsg("Could not turn on notifications. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1c2b1e]">
            <Bell className="h-5 w-5 text-[#52de76]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-card-foreground">Turn on order notifications</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Get a phone notification every time a new order comes in.
            </p>
            {msg && <p className="mt-1.5 text-xs font-medium text-muted-foreground">{msg}</p>}
            <div className="mt-3 flex gap-2">
              <button
                onClick={allow}
                disabled={busy}
                className="rounded-lg bg-[#1ed149] px-4 py-2 text-xs font-bold text-black transition hover:bg-[#52de76] disabled:opacity-60"
              >
                {busy ? "Please wait…" : "Allow notifications"}
              </button>
              <button
                onClick={dismiss}
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            onClick={dismiss}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
