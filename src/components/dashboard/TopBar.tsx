import { Bell, ChevronDown, LogOut, Menu, Search, ShieldCheck, Store, UserRound } from "lucide-react";
import { logout } from "@/lib/auth.functions";
import sidekickTop from "@/assets/icons/topbar-sidekick.png.asset.json";
import { useState } from "react";
import { useDashboard } from "@/lib/dashboard-store";
import { badgeTextColor } from "@/lib/dashboard-data";
import { NotificationPanel } from "./NotificationPanel";
import bagLogo from "@/assets/shopify-bag.png.asset.json";

export function TopBar() {
  const { setSidebarOpen, custom, t } = useDashboard();
  const badgeStyle = { backgroundColor: custom.badgeColor, color: badgeTextColor(custom.badgeColor) };
  const roundStyle = { backgroundColor: custom.roundColor, color: badgeTextColor(custom.roundColor) };
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <header className="dashboard-topbar fixed inset-x-0 top-0 z-40 grid h-[60px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1 bg-topbar px-2 text-topbar-foreground sm:flex sm:gap-3 sm:px-3 lg:px-5">
        <button
          aria-label="Open menu"
          className="shrink-0 rounded-md p-2 hover:bg-topbar-foreground/10 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 items-center sm:max-w-[45%] lg:max-w-[40%]">
          <img src={custom.logo ?? bagLogo.url} alt="Store logo" className="h-7 w-auto max-w-7 shrink-0 object-contain" />
          <span className="ml-2 truncate text-[22px] font-extrabold leading-none tracking-[-0.02em] sm:ml-3" title={custom.storeName}>{custom.storeName}</span>
          <span className="ml-3.5 hidden shrink-0 rounded-full border border-topbar-foreground/25 px-3 py-[3px] text-[13px] font-bold italic tracking-wide text-topbar-foreground/70 sm:block">
            Winter &apos;26
          </span>
        </div>

        <div className="mx-auto hidden w-full min-w-0 max-w-xl flex-1 items-center gap-2.5 rounded-lg bg-topbar-foreground/10 px-3 py-2 md:flex">
          <Search className="h-[18px] w-[18px] shrink-0 text-topbar-foreground/60" />
          <input
            placeholder={t("Search")}
            className="w-full min-w-0 bg-transparent text-sm text-topbar-foreground placeholder:text-topbar-foreground/50 focus:outline-none"
          />
          <span className="flex shrink-0 items-center gap-1">
            <kbd className="rounded-md border border-topbar-foreground/20 px-1.5 py-0.5 text-xs text-topbar-foreground/60">
              ⌘
            </kbd>
            <kbd className="rounded-md border border-topbar-foreground/20 px-1.5 py-0.5 text-xs text-topbar-foreground/60">
              K
            </kbd>
          </span>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0">
          <button
            aria-label="Sidekick"
            className="shrink-0 rounded-md p-2 hover:bg-topbar-foreground/10 sm:p-2.5"
          >
            <img src={sidekickTop.url} alt="" className="h-[30px] w-[30px] object-contain" />
          </button>
          <button
            aria-label="Notifications"
            onClick={() => setPanelOpen(true)}
            className="shrink-0 rounded-md p-2 hover:bg-topbar-foreground/10 sm:p-2.5"
          >
            <Bell className="h-[22px] w-[22px]" />
          </button>

          {/* Account circle — hover opens the account menu */}
          <div className="group relative ml-1 flex min-w-0 items-center gap-2.5">
            <button
              aria-label="Account menu"
              style={badgeStyle}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ring-topbar-foreground/30 transition-shadow hover:ring-2"
            >
              {custom.initials}
            </button>
            <span className="hidden max-w-24 truncate text-sm font-semibold sm:block lg:max-w-40" title={custom.profileName}>{custom.profileName}</span>

            <div className="account-dropdown invisible absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-1rem)] translate-y-1 overflow-y-auto rounded-xl border border-border bg-popover text-popover-foreground opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <span style={roundStyle} className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold">
                  {custom.roundInitial}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{custom.profileName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    shopify.myshopify.com
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
                <a
                  href="/admin"
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium hover:bg-muted"
                >
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  Admin panel
                </a>
                <button
                  onClick={async () => {
                    await logout();
                    window.location.replace("/login");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium hover:bg-muted"
                >
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
