import { createFileRoute } from "@tanstack/react-router";
import { Tags } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";

export const Route = createFileRoute("/_app/products")({
  head: () => ({
    meta: [
      { title: "Shopify — Products" },
      { name: "description", content: "Manage your Shopify product catalog." },
      { property: "og:title", content: "Shopify — Products" },
      { property: "og:description", content: "Manage your Shopify product catalog." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  return (
    <EmptyState
      title="Products"
      searchPlaceholder="Search products"
      icon={Tags}
      emptyTitle="No products found"
      emptySubtitle="Add products to start selling"
      actionLabel="Add product"
      secondaryLabel="Add product"
      learnMore="Learn more about products"
    />
  );
}
