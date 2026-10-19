import { Bell, ChevronDown, LogOut, Menu, Search, Store, UserRound } from "lucide-react";
import { useState } from "react";
import { useDashboard } from "@/lib/dashboard-store";
import { NotificationPanel } from "./NotificationPanel";
import bagLogo from "@/assets/bag-logo.png.asset.json";

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

        <div className="flex items-center gap-2.5">
          <img src={bagLogo.url} alt="Store logo" className="h-8 w-auto" />
          <span className="text-xl font-bold tracking-tight">Shopify</span>
          <span className="hidden rounded-full border border-topbar-foreground/30 px-2.5 py-0.5 text-[11px] font-medium text-topbar-foreground/70 sm:block">
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

          {/* Account circle — hover opens the account menu */}
          <div className="group relative ml-1 flex items-center gap-2">
            <button
              aria-label="Account menu"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-teal text-xs font-bold text-primary-foreground ring-topbar-foreground/30 transition-shadow hover:ring-2"
            >
              RD
            </button>
            <span className="hidden text-sm font-medium sm:block">Dashora</span>

            <div className="invisible absolute right-0 top-full z-50 mt-2 w-72 translate-y-1 rounded-xl border border-border bg-popover text-popover-foreground opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal text-sm font-bold text-primary-foreground">
                  RD
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Dashora</p>
                  <p className="truncate text-xs text-muted-foreground">
                    dashora.myshopify.com
                  </p>
                </div>
              </div>
              <div className="p-1.5">
                <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium hover:bg-muted">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  All stores
                </button>
                <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium hover:bg-muted">
                  <UserRound className="h-4 w-4 text-muted-foreground" />
                  Manage account
                </button>
                <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium hover:bg-muted">
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                  Log out
                </button>
              </div>
              <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
                <span>Winter &apos;26 plan</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <NotificationPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}
