import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";

export const Route = createFileRoute("/_app/marketing")({
  head: () => ({
    meta: [
      { title: "Dashora — Marketing" },
      { name: "description", content: "Create and track marketing campaigns in Dashora." },
      { property: "og:title", content: "Dashora — Marketing" },
      { property: "og:description", content: "Create and track marketing campaigns in Dashora." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MarketingPage,
});

function MarketingPage() {
  return (
    <EmptyState
      title="Marketing"
      searchPlaceholder="Search campaigns"
      icon={Megaphone}
      emptyTitle="No campaigns found"
      emptySubtitle="Promote your store with campaigns"
      actionLabel="Create campaign"
      secondaryLabel="Create campaign"
      learnMore="Learn more about marketing"
    />
  );
}
