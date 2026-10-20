import { createFileRoute } from "@tanstack/react-router";

// Temporary one-off test route: sends 5 sample order push notifications to all
// registered devices. Guarded by a one-time token; delete after use.
const ONE_TIME_TOKEN = "tmp-push-test-9f3k2x7q1w";

const SAMPLES = [
  { title: "New order", body: "HoH Fashion has a new order for 2 items totaling $70.49 from Online Store." },
  { title: "New order", body: "HoH Fashion has a new order for 1 item totaling $29.68 from Online Store." },
  { title: "New order", body: "HoH Fashion has a new order for 3 items totaling $104.99 from Facebook & Instagram." },
  { title: "New order", body: "HoH Fashion has a new order for 1 item totaling $19.50 from Online Store." },
  { title: "New order", body: "HoH Fashion has a new order for 4 items totaling $150.25 from Point of Sale." },
];

export const Route = createFileRoute("/api/public/send-test-push")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (request.headers.get("x-test-token") !== ONE_TIME_TOKEN) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { sendWebPush } = await import("@/lib/webpush.server");
        const { data: subs, error } = await supabaseAdmin
          .from("push_subscriptions")
          .select("id, endpoint, p256dh, auth");
        if (error) return Response.json({ error: error.message }, { status: 500 });

        const results: unknown[] = [];
        for (const sample of SAMPLES) {
          for (const s of subs ?? []) {
            const res = await sendWebPush(s, { ...sample, url: "/orders" });
            if (!res.ok && (res.status === 404 || res.status === 410)) {
              await supabaseAdmin.from("push_subscriptions").delete().eq("id", s.id);
            }
            results.push({ body: sample.body, status: res.status, ok: res.ok });
          }
        }
        return Response.json({ devices: subs?.length ?? 0, results });
      },
    },
  },
});
