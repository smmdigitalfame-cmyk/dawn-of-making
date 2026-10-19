import { Bell, Menu, Package, Search, Store } from "lucide-react";
import { useState } from "react";
import { useDashboard } from "@/lib/dashboard-store";
import { NotificationPanel } from "./NotificationPanel";

export function TopBar() {
  const { setSidebarOpen } = useDashboard();
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 bg-topbar px-3 text-topbar-foreground lg:px-4">
        <button
          aria-label="Open menu"
          className="rounded-md p-2 hover:bg-topbar-foreground/10 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <Package className="h-6 w-6" strokeWidth={2} />
          <span className="text-lg font-bold tracking-tight">Dashora</span>
          <span className="hidden rounded px-1.5 py-0.5 text-[11px] font-medium text-topbar-foreground/60 sm:block">
            Winter &apos;26
          </span>
        </div>

        <div className="mx-auto hidden w-full max-w-xl items-center gap-2 rounded-lg bg-topbar-foreground/10 px-3 py-1.5 md:flex">
          <Search className="h-4 w-4 text-topbar-foreground/60" />
          <input
            placeholder="Search"
            className="w-full bg-transparent text-sm text-topbar-foreground placeholder:text-topbar-foreground/50 focus:outline-none"
          />
          <kbd className="rounded border border-topbar-foreground/20 px-1.5 text-[11px] text-topbar-foreground/60">
            ⌘K
          </kbd>
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <button
            aria-label="Store"
            className="rounded-md p-2 hover:bg-topbar-foreground/10"
          >
            <Store className="h-5 w-5" />
          </button>
          <button
            aria-label="Notifications"
            onClick={() => setPanelOpen(true)}
            className="rounded-md p-2 hover:bg-topbar-foreground/10"
          >
            <Bell className="h-5 w-5" />
          </button>
          <div className="ml-1 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal text-xs font-bold text-primary-foreground">
              RD
            </span>
            <span className="hidden text-sm font-medium sm:block">Dashora</span>
          </div>
        </div>
      </header>

      <NotificationPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}
