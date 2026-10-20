import { createFileRoute } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";

export const Route = createFileRoute("/_app/orders")({
  head: () => ({
    meta: [
      { title: "Shopify — Orders" },
      { name: "description", content: "View and manage your Shopify store orders." },
      { property: "og:title", content: "Shopify — Orders" },
      { property: "og:description", content: "View and manage your Shopify store orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  return (
    <EmptyState
      title="Orders"
      searchPlaceholder="Search orders"
      icon={ShoppingBag}
      emptyTitle="No orders found"
      emptySubtitle="Your orders will appear here"
      actionLabel="Create order"
      secondaryLabel="Create order"
      learnMore="Learn more about orders"
    />
  );
}
