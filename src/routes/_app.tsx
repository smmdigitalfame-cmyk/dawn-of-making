import { Outlet, createFileRoute } from "@tanstack/react-router";
import { LiveBanners } from "@/components/dashboard/LiveBanners";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { DashboardProvider } from "@/lib/dashboard-store";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-background">
        <TopBar />
        <Sidebar />
        <LiveBanners />
        <main className="pt-[60px] lg:pl-[240px]">
          <div className="px-4 py-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </DashboardProvider>
  );
}
