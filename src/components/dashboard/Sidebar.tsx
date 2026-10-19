import { Link, useRouterState } from "@tanstack/react-router";
import {
  BadgePercent,
  BarChart3,
  Boxes,
  Briefcase,
  ChevronDown,
  Globe,
  Home,
  Image,
  Inbox,
  LayoutGrid,
  MonitorSmartphone,
  Settings,
  Store,
  Tag,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/lib/dashboard-store";

const MAIN_ITEMS = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/orders", label: "Orders", icon: Inbox, badge: "4,519" },
  { to: "/products", label: "Products", icon: Tag },
  { to: "/customers", label: "Customers", icon: User },
  { to: "/marketing", label: "Marketing", icon: BarChart3 },
  { to: "/discounts", label: "Discounts", icon: BadgePercent },
  { to: "/content", label: "Content", icon: Image },
  { to: "/metaobjects", label: "Metaobjects", icon: Boxes },
  { to: "/markets", label: "Markets", icon: Globe },
  { to: "/finances", label: "Finances", icon: Briefcase },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

const CHANNEL_ITEMS = [
  { to: "/online-store", label: "Online Store", icon: Store },
  { to: "/pos", label: "Point of Sale", icon: MonitorSmartphone },
] as const;

function NavLink({
  to,
  label,
  icon: Icon,
  badge,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: typeof Home;
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
        "flex items-center gap-3 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
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

      <div className="mt-4 flex items-center gap-1 px-3 text-[12px] font-medium text-muted-foreground">
        Sales channels
        <ChevronDown className="h-3.5 w-3.5" />
      </div>
      {CHANNEL_ITEMS.map((item) => (
        <NavLink key={item.to} {...item} onNavigate={onNavigate} />
      ))}

      <div className="mt-4 flex items-center gap-1 px-3 text-[12px] font-medium text-muted-foreground">
        Apps
        <ChevronDown className="h-3.5 w-3.5" />
      </div>
      <NavLink to="/apps" label="Apps" icon={LayoutGrid} onNavigate={onNavigate} />

      <div className="mt-auto pt-4">
        <NavLink to="/settings" label="Settings" icon={Settings} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useDashboard();
  return (
    <>
      {/* Desktop */}
      <aside className="fixed bottom-0 left-0 top-14 z-30 hidden w-[220px] border-r border-sidebar-border bg-sidebar lg:block">
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
                <Package className="h-4 w-4" /> Dashora
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
