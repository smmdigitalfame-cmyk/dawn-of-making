import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";

export const Route = createFileRoute("/_app/customers")({
  head: () => ({
    meta: [
      { title: "Dashora — Customers" },
      { name: "description", content: "Build lasting customer relationships with Dashora." },
      { property: "og:title", content: "Dashora — Customers" },
      { property: "og:description", content: "Build lasting customer relationships with Dashora." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  return (
    <EmptyState
      title="Customers"
      searchPlaceholder="Search customers"
      icon={User}
      emptyTitle="No customers found"
      emptySubtitle="Build lasting customer relationships"
      actionLabel="Add customer"
      secondaryLabel="Add customer"
      learnMore="Learn more about customers"
    />
  );
}
