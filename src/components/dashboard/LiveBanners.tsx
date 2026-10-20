import { ShoppingBag, X } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-store";

export function LiveBanners() {
  const { banners, dismissBanner, notif } = useDashboard();
  if (banners.length === 0) return null;

  return (
    <div className="live-banners pointer-events-none fixed right-4 top-16 z-[60] flex max-h-[calc(100dvh-5rem)] w-80 max-w-[calc(100vw-2rem)] flex-col gap-2 overflow-y-auto">
      {banners.map((b) => (
        <div
          key={b.id}
          className="pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-popover p-3 shadow-xl animate-in slide-in-from-right-5 fade-in duration-300"
        >
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <ShoppingBag className="h-4 w-4 text-secondary-foreground" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {notif.storeName}
            </p>
            <p className="truncate text-xs text-muted-foreground">{b.title}</p>
            <p className="mt-0.5 text-xs font-medium text-foreground">{b.amount}</p>
          </div>
          <button
            aria-label="Dismiss"
            onClick={() => dismissBanner(b.id)}
            className="rounded p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
