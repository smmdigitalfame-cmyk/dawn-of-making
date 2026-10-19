import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { useState } from "react";
import bagLogo from "@/assets/shopify-bag.png.asset.json";
import { getAuthSession, login } from "@/lib/auth.functions";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const s = await getAuthSession();
    if (s.authenticated) throw redirect({ to: "/home" });
  },
  head: () => ({
    meta: [
      { title: "Sign in — Dashora" },
      { name: "description", content: "Sign in to your Dashora store dashboard." },
      { property: "og:title", content: "Sign in — Dashora" },
      { property: "og:description", content: "Sign in to your Dashora store dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await login({ data: { username, password } });
      if (!res.ok) {
        setError(res.error ?? "Incorrect username or password.");
        return;
      }
      await router.navigate({ to: "/home", replace: true });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="login-glow login-glow-a" />
      <div className="login-glow login-glow-b" />

      <div className="editor-in relative w-full max-w-[400px]">
        <div className="mb-8 flex items-center justify-center gap-3 text-topbar-foreground">
          <img src={bagLogo.url} alt="" className="h-9 w-auto" />
          <span className="text-[26px] font-extrabold tracking-[-0.02em]">Shopify</span>
          <span className="rounded-full border border-topbar-foreground/25 px-3 py-[3px] text-[13px] font-bold italic text-topbar-foreground/70">
            Winter &apos;26
          </span>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-topbar-foreground/10 bg-card/95 p-8 shadow-2xl backdrop-blur"
        >
          <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to continue to your dashboard.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-[13px] font-medium text-foreground">
                Username
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={username}
                  maxLength={100}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-4 focus:ring-foreground/5"
                  placeholder="Enter username"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={password}
                  maxLength={200}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-10 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-4 focus:ring-foreground/5"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  aria-label={show ? "Hide password" : "Show password"}
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-topbar text-sm font-semibold text-topbar-foreground shadow-lg transition hover:opacity-90 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-topbar-foreground/50">Protected area · Authorized access only</p>
      </div>
    </div>
  );
}
