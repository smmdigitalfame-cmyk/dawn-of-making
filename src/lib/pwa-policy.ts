/** App-shell workers must never control editor previews or development. */
export function mayRegisterAppWorker(production: boolean, hostname: string, framed: boolean, search: string) {
  return production && !framed && !new URLSearchParams(search).has("sw") &&
    !hostname.startsWith("id-preview--") && !hostname.startsWith("preview--") &&
    !["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"].some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    );
}

export function isAppWorker(scriptURL: string, origin: string) {
  const url = new URL(scriptURL, origin);
  return url.origin === origin && url.pathname === "/sw.js";
}