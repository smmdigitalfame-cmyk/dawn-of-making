import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/lib/dashboard-store";
import bagLogo from "@/assets/bag-logo.png.asset.json";
import iconHome from "@/assets/icons/icon-home.png.asset.json";
import iconOrders from "@/assets/icons/icon-orders.png.asset.json";
import iconProducts from "@/assets/icons/icon-products.png.asset.json";
import iconCustomers from "@/assets/icons/icon-customers.png.asset.json";
import iconMarketing from "@/assets/icons/icon-marketing.png.asset.json";
import iconDiscounts from "@/assets/icons/icon-discounts.png.asset.json";
import iconContent from "@/assets/icons/icon-content.png.asset.json";
import iconMetaobjects from "@/assets/icons/icon-metaobjects.png.asset.json";
import iconMarkets from "@/assets/icons/icon-markets.png.asset.json";
import iconFinances from "@/assets/icons/icon-finances.png.asset.json";
import iconAnalytics from "@/assets/icons/icon-analytics.png.asset.json";
import iconOnlineStore from "@/assets/icons/icon-online-store.png.asset.json";
import iconPos from "@/assets/icons/icon-pos.png.asset.json";
import iconApps from "@/assets/icons/icon-apps.png.asset.json";
import iconSettings from "@/assets/icons/icon-settings.png.asset.json";

const MAIN_ITEMS = [
  { to: "/home", label: "Home", icon: iconHome.url },
  { to: "/orders", label: "Orders", icon: iconOrders.url, badge: "4,519" },
  { to: "/products", label: "Products", icon: iconProducts.url },
  { to: "/customers", label: "Customers", icon: iconCustomers.url },
  { to: "/marketing", label: "Marketing", icon: iconMarketing.url },
  { to: "/discounts", label: "Discounts", icon: iconDiscounts.url },
  { to: "/content", label: "Content", icon: iconContent.url },
  { to: "/metaobjects", label: "Metaobjects", icon: iconMetaobjects.url },
  { to: "/markets", label: "Markets", icon: iconMarkets.url },
  { to: "/finances", label: "Finances", icon: iconFinances.url },
  { to: "/analytics", label: "Analytics", icon: iconAnalytics.url },
] as const;

const CHANNEL_ITEMS = [
  { to: "/online-store", label: "Online Store", icon: iconOnlineStore.url },
  { to: "/pos", label: "Point of Sale", icon: iconPos.url },
] as const;

function NavLink({
  to,
  label,
  icon,
  badge,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: string;
  badge?: string;
  onNavigate?: (() => void) | undefined;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = pathname === to;
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[15px] font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
      )}
    >
      <img src={icon} alt="" className="h-[22px] w-[22px] shrink-0 object-contain" />
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
          {badge}
        </span>
      )}
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-1 overflow-y-auto px-3 py-3">
      {MAIN_ITEMS.map((item) => (
        <NavLink key={item.to} {...item} onNavigate={onNavigate} />
      ))}

      <div className="mt-4 flex items-center gap-1 px-3.5 text-[13px] font-medium text-muted-foreground">
        Sales channels
        <ChevronDown className="h-4 w-4" />
      </div>
      {CHANNEL_ITEMS.map((item) => (
        <NavLink key={item.to} {...item} onNavigate={onNavigate} />
      ))}

      <div className="mt-4 flex items-center gap-1 px-3.5 text-[13px] font-medium text-muted-foreground">
        Apps
        <ChevronDown className="h-4 w-4" />
      </div>
      <NavLink to="/apps" label="Apps" icon={iconApps.url} onNavigate={onNavigate} />

      <div className="mt-auto pt-4">
        <NavLink to="/settings" label="Settings" icon={iconSettings.url} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useDashboard();
  return (
    <>
      {/* Desktop */}
      <aside className="fixed bottom-0 left-0 top-[72px] z-30 hidden w-[300px] border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[260px] bg-sidebar shadow-xl">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <img src={bagLogo.url} alt="Store logo" className="h-6 w-auto" /> Shopify
              </span>
              <button
                aria-label="Close menu"
                onClick={() => setSidebarOpen(false)}
                className="rounded-md p-1.5 hover:bg-sidebar-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
