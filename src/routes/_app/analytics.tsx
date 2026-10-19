import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({
    meta: [
      { title: "Dashora — Analytics" },
      { name: "description", content: "Reports and insights about your store performance." },
      { property: "og:title", content: "Dashora — Analytics" },
      { property: "og:description", content: "Reports and insights about your store performance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <EmptyState
      title="Analytics"
      searchPlaceholder="Search reports"
      icon={BarChart3}
      emptyTitle="No reports found"
      emptySubtitle="Insights about your store will appear here"
      actionLabel="Create report"
      secondaryLabel="Create report"
      learnMore="Learn more about analytics"
    />
  );
}
