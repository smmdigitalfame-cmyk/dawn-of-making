import { createFileRoute } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";

export const Route = createFileRoute("/_app/orders")({
  head: () => ({
    meta: [
      { title: "Dashora — Orders" },
      { name: "description", content: "View and manage your Dashora store orders." },
      { property: "og:title", content: "Dashora — Orders" },
      { property: "og:description", content: "View and manage your Dashora store orders." },
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
