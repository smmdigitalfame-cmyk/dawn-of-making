import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const COOKIE = "dashora_session";
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

export const getAuthSession = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  const secret = process.env.SESSION_SECRET;
  const raw = getCookie(COOKIE);
  if (!secret || !raw) return { authenticated: false };
  const [exp, sig] = raw.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return { authenticated: false };
  const expected = await sign(exp, secret);
  return { authenticated: safeEqual(sig, expected) };
});

export const login = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ username: z.string().trim().min(1).max(100), password: z.string().min(1).max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { setCookie } = await import("@tanstack/react-start/server");
    const user = process.env.DASHBOARD_USERNAME;
    const pass = process.env.DASHBOARD_PASSWORD;
    const secret = process.env.SESSION_SECRET;
    if (!user || !pass || !secret) return { ok: false, error: "Login is not set up yet." };
    const okUser = safeEqual(data.username, user);
    const okPass = safeEqual(data.password, pass);
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

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const { deleteCookie } = await import("@tanstack/react-start/server");
  deleteCookie(COOKIE, { path: "/" });
  return { ok: true };
});
