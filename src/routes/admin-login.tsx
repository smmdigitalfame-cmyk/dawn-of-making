import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { adminLogin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin-login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin sign in — Shopify" },
      { name: "description", content: "Sign in to the Shopify admin panel." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await adminLogin({ data: { username, password } });
      if (r.ok) {
        navigate({ to: "/admin" });
      } else {
        setError(r.error ?? "Incorrect username or password.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0b0d12] px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#14171f] p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1c2b1e]">
            <ShieldCheck className="h-6 w-6 text-[#52de76]" />
          </span>
          <h1 className="text-xl font-bold text-white">Admin panel</h1>
          <p className="text-sm text-white/50">Sign in to manage notifications and products</p>
        </div>

        {error && (
          <div role="alert" className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="admin-user" className="mb-1.5 block text-sm font-medium text-white/70">
              Username
            </label>
            <input
              id="admin-user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="username"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-white outline-none focus:border-[#52de76]/60"
              placeholder="Username"
            />
          </div>
          <div>
            <label htmlFor="admin-pass" className="mb-1.5 block text-sm font-medium text-white/70">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-pass"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="current-password"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 pr-11 text-base text-white outline-none focus:border-[#52de76]/60"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-white/50 hover:text-white"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-[#1ed149] py-2.5 text-sm font-bold text-black transition hover:bg-[#52de76] disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
