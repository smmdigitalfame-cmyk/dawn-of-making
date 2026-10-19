import { createFileRoute } from "@tanstack/react-router";
import { Globe } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";

export const Route = createFileRoute("/_app/online-store")({
  head: () => ({
    meta: [
      { title: "Dashora — Online Store" },
      { name: "description", content: "Customize your online store theme and pages." },
      { property: "og:title", content: "Dashora — Online Store" },
      { property: "og:description", content: "Customize your online store theme and pages." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OnlineStorePage,
});

function OnlineStorePage() {
  return (
    <EmptyState
      title="Online Store"
      searchPlaceholder="Search themes"
      icon={Globe}
      emptyTitle="No theme published"
      emptySubtitle="Customize your storefront"
      actionLabel="Customize theme"
      secondaryLabel="Customize theme"
      learnMore="Learn more about online store"
    />
  );
}
