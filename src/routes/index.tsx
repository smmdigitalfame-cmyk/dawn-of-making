import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashora — Dashboard access" },
      { name: "description", content: "Access your Dashora store dashboard." },
      { property: "og:title", content: "Dashora — Dashboard access" },
      { property: "og:description", content: "Access your Dashora store dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/home" });
  },
});
