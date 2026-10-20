import { isAppWorker, mayRegisterAppWorker } from "./pwa-policy";

export async function registerAppWorker() {
  if (!("serviceWorker" in navigator)) return;
  const allowed = mayRegisterAppWorker(import.meta.env.PROD, location.hostname, window.self !== window.top, location.search);
  if (!allowed) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.filter((registration) =>
      [registration.active, registration.waiting, registration.installing].some(
        (worker) => worker && isAppWorker(worker.scriptURL, location.origin),
      ),
    ).map((registration) => registration.unregister()));
    return;
  }
  const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  // Check for updates on a normal visit; never force reload during a form/session.
  await registration.update();
}