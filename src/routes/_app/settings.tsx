import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { NotificationPanel } from "@/components/dashboard/NotificationPanel";
import { useDashboard } from "@/lib/dashboard-store";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Shopify — Settings" },
      { name: "description", content: "Store and notification settings for Shopify." },
      { property: "og:title", content: "Shopify — Settings" },
      { property: "og:description", content: "Store and notification settings for Shopify." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { notif, currency } = useDashboard();
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-4 text-xl font-semibold text-foreground">Settings</h1>
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold text-foreground">Notifications</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Store: <strong className="text-foreground">{notif.storeName}</strong> ·
          Currency: <strong className="text-foreground">{currency}</strong> · Status:{" "}
          <strong className="text-foreground">{notif.running ? "Live" : "Idle"}</strong>
        </p>
        <button
          onClick={() => setPanelOpen(true)}
          className="mt-3 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
        >
          Open notification settings
        </button>
      </div>
      <NotificationPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  );
}
