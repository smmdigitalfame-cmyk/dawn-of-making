import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CURRENCIES } from "@/lib/dashboard-data";
import { useDashboard } from "@/lib/dashboard-store";
import { cn } from "@/lib/utils";
import { enablePhonePush, PUSH_MESSAGES } from "@/lib/push-client";
import { sendTestPush } from "@/lib/push.functions";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

export function NotificationPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { notif, updateNotif, currency, setCurrency } = useDashboard();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushMsg, setPushMsg] = useState("");
  const currencyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currencyOpen) return;
    const handler = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [currencyOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close settings"
        className="absolute inset-0 bg-foreground/40"
        onClick={onClose}
      />
      <div className="notification-panel absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto overscroll-contain bg-card shadow-2xl">
        <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">
            Notification settings
          </h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="rounded-md p-1.5 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4 px-5 py-5">
          <Field label="Store name">
            <input
              className={inputClass}
              value={notif.storeName}
              onChange={(e) => updateNotif({ storeName: e.target.value })}
            />
          </Field>

          <Field label="Interval (seconds)">
            <input
              className={inputClass}
              type="number"
              min={1}
              value={notif.intervalSec}
              onChange={(e) =>
                updateNotif({ intervalSec: Math.max(1, Number(e.target.value) || 1) })
              }
            />
          </Field>

          <label className="flex items-center gap-2 rounded-lg border border-input px-3 py-2.5">
            <input
              type="checkbox"
              checked={notif.randomInterval}
              onChange={(e) => updateNotif({ randomInterval: e.target.checked })}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Random interval (seconds)
            </span>
          </label>

          <Field label="Notifications per interval">
            <input
              className={inputClass}
              type="number"
              min={1}
              value={notif.perInterval}
              onChange={(e) =>
                updateNotif({ perInterval: Math.max(1, Number(e.target.value) || 1) })
              }
            />
          </Field>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={notif.fastBanner}
              onChange={(e) => updateNotif({ fastBanner: e.target.checked })}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Fast banner mode
            </span>
          </label>

          <Field label="Currency">
            <div className="relative" ref={currencyRef}>
              <button
                type="button"
                onClick={() => setCurrencyOpen((v) => !v)}
                className={cn(inputClass, "flex items-center justify-between text-left")}
              >
                <span>{currency}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              {currencyOpen && (
                <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-popover py-1 shadow-lg">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setCurrency(c.code);
                        setCurrencyOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted",
                        c.code === currency && "font-semibold",
                      )}
                    >
                      <span className="w-4">
                        {c.code === currency && <Check className="h-4 w-4" />}
                      </span>
                      {c.code}
                      <span className="ml-auto text-muted-foreground">{c.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>

          {notif.running ? (
            <button
              onClick={() => updateNotif({ running: false })}
              className="mt-2 w-full rounded-lg border border-input bg-card py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-muted"
            >
              Stop Notifications
            </button>
          ) : (
            <button
              onClick={() => updateNotif({ running: true })}
              className="mt-2 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start Notifications
            </button>
          )}

          <p className="pb-2 text-center text-xs text-muted-foreground">
            Status: {notif.running ? "Live" : "Idle"}
          </p>

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Phone notifications
            </span>
            <button
              type="button"
              disabled={pushBusy}
              onClick={async () => {
                setPushBusy(true);
                try {
                  setPushMsg(PUSH_MESSAGES[await enablePhonePush()]);
                } catch (e) {
                  setPushMsg(e instanceof Error ? e.message : "Could not turn on notifications.");
                } finally {
                  setPushBusy(false);
                }
              }}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              Turn on phone notifications
            </button>
            <button
              type="button"
              disabled={pushBusy}
              onClick={async () => {
                setPushBusy(true);
                try {
                  const n = 1000 + Math.floor(Math.random() * 9000);
                  const r = await sendTestPush({
                    data: {
                      title: `${notif.storeName || "Shopify"}`,
                      body: `New order #${n} · ₹${(500 + Math.floor(Math.random() * 4500)).toLocaleString("en-IN")} · Online Store`,
                    },
                  });
                  setPushMsg(
                    r.devices === 0
                      ? "No phone is registered yet. Turn on notifications first."
                      : r.failures.length
                        ? `Sent to ${r.sent}/${r.devices}. Error: ${r.failures[0]}`
                        : `Test sent to ${r.sent} device(s).`,
                  );
                } catch (e) {
                  setPushMsg(e instanceof Error ? e.message : "Could not send.");
                } finally {
                  setPushBusy(false);
                }
              }}
              className="w-full rounded-lg border border-input bg-card py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              Send test notification
            </button>
            {pushMsg && <p className="text-xs text-muted-foreground" role="status">{pushMsg}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
