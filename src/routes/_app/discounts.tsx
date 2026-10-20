import { createFileRoute } from "@tanstack/react-router";
import { Percent } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";

export const Route = createFileRoute("/_app/discounts")({
  head: () => ({
    meta: [
      { title: "Shopify — Discounts" },
      { name: "description", content: "Manage discount codes and automatic discounts." },
      { property: "og:title", content: "Shopify — Discounts" },
      { property: "og:description", content: "Manage discount codes and automatic discounts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DiscountsPage,
});

function DiscountsPage() {
  return (
    <EmptyState
      title="Discounts"
      searchPlaceholder="Search discounts"
      icon={Percent}
      emptyTitle="No discounts found"
      emptySubtitle="Create discounts to boost sales"
      actionLabel="Create discount"
      secondaryLabel="Create discount"
      learnMore="Learn more about discounts"
    />
  );
}
