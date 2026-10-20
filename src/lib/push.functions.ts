import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getAuthSession } from "./auth.functions";

async function requireLogin() {
  const s = await getAuthSession();
  if (!s.authenticated) throw new Error("Please sign in first.");
}

export const getPushPublicKey = createServerFn({ method: "GET" }).handler(async () => {
  await requireLogin();
  const { vapidKeys } = await import("./webpush.server");
  return { publicKey: vapidKeys().publicKey };
});

export const savePushSubscription = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      endpoint: z.string().url().max(1000).startsWith("https://"),
      p256dh: z.string().min(20).max(200),
      auth: z.string().min(8).max(100),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    await requireLogin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("push_subscriptions").upsert(data, { onConflict: "endpoint" });
    if (error) throw new Error(error.message);
    console.log(`[push-register] endpoint=${data.endpoint.slice(-12)}`);
    return { ok: true };
  });

export const sendTestPush = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ title: z.string().min(1).max(80), body: z.string().min(1).max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    await requireLogin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendWebPush } = await import("./webpush.server");
    const { data: subs, error } = await supabaseAdmin.from("push_subscriptions").select("id, endpoint, p256dh, auth");
    if (error) throw new Error(error.message);
    let sent = 0;
    const failures: string[] = [];
    for (const s of subs ?? []) {
      const res = await sendWebPush(s, { ...data, url: "/orders" });
      if (res.ok) sent++;
      else if (res.status === 404 || res.status === 410) {
        await supabaseAdmin.from("push_subscriptions").delete().eq("id", s.id);
      } else failures.push(`${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
    return { sent, devices: subs?.length ?? 0, failures };
  });
