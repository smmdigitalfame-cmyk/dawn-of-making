import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const COOKIE = "dashora_admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  const secret = process.env["SESSION_SECRET"];
  const raw = getCookie(COOKIE);
  if (!secret || !raw) return { authenticated: false };
  const [exp, sig] = raw.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return { authenticated: false };
  const expected = await sign(exp, secret);
  return { authenticated: safeEqual(sig, expected) };
});

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ username: z.string().trim().min(1).max(100), password: z.string().min(1).max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { setCookie } = await import("@tanstack/react-start/server");
    // Dedicated admin credentials fall back to the dashboard ones so one ID/password works everywhere.
    const user = process.env["ADMIN_USERNAME"] ?? process.env["DASHBOARD_USERNAME"];
    const pass = process.env["ADMIN_PASSWORD"] ?? process.env["DASHBOARD_PASSWORD"];
    const secret = process.env["SESSION_SECRET"];
    if (!user || !pass || !secret) return { ok: false, error: "Login is not set up yet." };
    const okUser = safeEqual(data.username.trim().toLowerCase(), user.trim().toLowerCase());
    const okPass = safeEqual(data.password.trim(), pass.trim());
    if (!okUser || !okPass) return { ok: false, error: "Incorrect username or password." };
    const exp = String(Date.now() + MAX_AGE * 1000);
    setCookie(COOKIE, `${exp}.${await sign(exp, secret)}`, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    });
    return { ok: true };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { deleteCookie } = await import("@tanstack/react-start/server");
  deleteCookie(COOKIE, { path: "/" });
  return { ok: true };
});

async function requireAdmin() {
  const s = await getAdminSession();
  if (!s.authenticated) throw new Error("Please sign in to the admin panel first.");
}

/** Send a push notification to every registered phone, from the admin panel. */
export const sendAdminPush = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ title: z.string().min(1).max(80), body: z.string().min(1).max(300) }).parse(d),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendWebPush } = await import("./webpush.server");
    const { data: subs, error } = await supabaseAdmin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth");
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
