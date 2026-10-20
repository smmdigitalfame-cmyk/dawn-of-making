// Imported into the app worker (/sw.js). Shows background push notifications.
function pushAck(id, stage, error) {
  try {
    return fetch("/api/public/push-ack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: String(id || "none").slice(0, 64),
        stage: stage,
        error: error ? String(error).slice(0, 200) : undefined,
        permission: typeof Notification !== "undefined" ? Notification.permission : "n/a",
      }),
    }).catch(function () {});
  } catch (e) {
    return Promise.resolve();
  }
}

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { body: event.data && event.data.text() }; }
  // Unique tag per push so Android never merges/replaces earlier order alerts.
  const tag = data.tag || "order-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  event.waitUntil(
    pushAck(data.id, "received").then(function () {
      return self.registration
        .showNotification(data.title || "Shopify", {
          body: data.body || "",
          icon: "/icons/app-192.png",
          badge: "/icons/badge-96.png",
          tag: tag,
          renotify: true,
          silent: false,
          vibrate: [200, 100, 200],
          timestamp: Date.now(),
          data: { url: data.url || "/home" },
        })
        .then(function () { return pushAck(data.id, "shown"); })
        .catch(function (err) { return pushAck(data.id, "failed", err && err.message); });
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/home";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) if ("focus" in c) { c.navigate(url); return c.focus(); }
      return self.clients.openWindow(url);
    }),
  );
});
