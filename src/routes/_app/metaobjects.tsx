import { createFileRoute } from "@tanstack/react-router";
import { Database } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";

export const Route = createFileRoute("/_app/metaobjects")({
  head: () => ({
    meta: [
      { title: "Shopify — Metaobjects" },
      { name: "description", content: "Structure custom data with metaobjects." },
      { property: "og:title", content: "Shopify — Metaobjects" },
      { property: "og:description", content: "Structure custom data with metaobjects." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MetaobjectsPage,
});

function MetaobjectsPage() {
  return (
    <EmptyState
      title="Metaobjects"
      searchPlaceholder="Search metaobjects"
      icon={Database}
      emptyTitle="No metaobjects found"
      emptySubtitle="Structure custom data for your store"
      actionLabel="Add definition"
      secondaryLabel="Add definition"
      learnMore="Learn more about metaobjects"
    />
  );
}
