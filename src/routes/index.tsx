import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shopify — Dashboard access" },
      { name: "description", content: "Access your Shopify store dashboard." },
      { property: "og:title", content: "Shopify — Dashboard access" },
      { property: "og:description", content: "Access your Shopify store dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/home" });
  },
});
