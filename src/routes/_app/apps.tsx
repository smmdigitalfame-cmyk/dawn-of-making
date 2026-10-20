import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";

export const Route = createFileRoute("/_app/apps")({
  head: () => ({
    meta: [
      { title: "Shopify — Apps" },
      { name: "description", content: "Extend your store with apps." },
      { property: "og:title", content: "Shopify — Apps" },
      { property: "og:description", content: "Extend your store with apps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AppsPage,
});

function AppsPage() {
  return (
    <EmptyState
      title="Apps"
      searchPlaceholder="Search apps"
      icon={LayoutGrid}
      emptyTitle="No apps installed"
      emptySubtitle="Extend your store with apps"
      actionLabel="Browse apps"
      secondaryLabel="Browse apps"
      learnMore="Learn more about apps"
    />
  );
}
