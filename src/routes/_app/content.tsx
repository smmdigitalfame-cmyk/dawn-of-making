import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";

export const Route = createFileRoute("/_app/content")({
  head: () => ({
    meta: [
      { title: "Dashora — Content" },
      { name: "description", content: "Manage files, pages and blog posts." },
      { property: "og:title", content: "Dashora — Content" },
      { property: "og:description", content: "Manage files, pages and blog posts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContentPage,
});

function ContentPage() {
  return (
    <EmptyState
      title="Content"
      searchPlaceholder="Search content"
      icon={FileText}
      emptyTitle="No content found"
      emptySubtitle="Create pages and blog posts"
      actionLabel="Add content"
      secondaryLabel="Add content"
      learnMore="Learn more about content"
    />
  );
}
