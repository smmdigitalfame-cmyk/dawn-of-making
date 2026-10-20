import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";

export const Route = createFileRoute("/_app/finances")({
  head: () => ({
    meta: [
      { title: "Shopify — Finances" },
      { name: "description", content: "Track payouts, balances and transactions." },
      { property: "og:title", content: "Shopify — Finances" },
      { property: "og:description", content: "Track payouts, balances and transactions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FinancesPage,
});

function FinancesPage() {
  return (
    <EmptyState
      title="Finances"
      searchPlaceholder="Search transactions"
      icon={Wallet}
      emptyTitle="No transactions found"
      emptySubtitle="Your payouts and balances will appear here"
      actionLabel="View payouts"
      secondaryLabel="View payouts"
      learnMore="Learn more about finances"
    />
  );
}
