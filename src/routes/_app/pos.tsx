import { createFileRoute } from "@tanstack/react-router";
import { Store } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";

export const Route = createFileRoute("/_app/pos")({
  head: () => ({
    meta: [
      { title: "Shopify — Point of Sale" },
      { name: "description", content: "Sell in person with Shopify Point of Sale." },
      { property: "og:title", content: "Shopify — Point of Sale" },
      { property: "og:description", content: "Sell in person with Shopify Point of Sale." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PosPage,
});

function PosPage() {
  return (
    <EmptyState
      title="Point of Sale"
      searchPlaceholder="Search point of sale"
      icon={Store}
      emptyTitle="No point of sale found"
      emptySubtitle="Sell in person"
      actionLabel="Open POS"
      secondaryLabel="Open POS"
      learnMore="Learn more about point of sale"
    />
  );
}
