import { createFileRoute } from "@tanstack/react-router";
import { Globe, Search, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/markets")({
  head: () => ({
    meta: [
      { title: "Dashora — Markets" },
      { name: "description", content: "Sell internationally with Dashora markets." },
      { property: "og:title", content: "Dashora — Markets" },
      { property: "og:description", content: "Sell internationally with Dashora markets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MarketsPage,
});

function MarketsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <h1 className="text-xl font-semibold text-foreground">Markets</h1>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-border bg-muted px-3 py-1.5 text-[13px] font-medium text-foreground hover:bg-muted/70">
            Export
          </button>
          <button className="rounded-lg bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90">
            Add market
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
          <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-[13px] font-medium text-foreground">Store default</span>
          <Search className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            placeholder="Search in all markets"
            className="w-full min-w-0 basis-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none sm:basis-0 sm:flex-1"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Morocco</span>
          <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
            Active
          </span>
          <span className="ml-auto flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <span className="inline-block h-3 w-4 rounded-sm bg-destructive" />
            Morocco
          </span>
        </div>

        <div className="flex flex-col gap-1 bg-muted/40 px-4 py-3">
          <button className="flex items-center gap-1.5 text-left text-[13px] font-medium text-teal hover:underline">
            <Sparkles className="h-3.5 w-3.5" /> Create European Union Market +
          </button>
          <button className="flex items-center gap-1.5 text-left text-[13px] font-medium text-teal hover:underline">
            <Sparkles className="h-3.5 w-3.5" /> Create United Kingdom Market +
          </button>
        </div>
      </div>
      <p className="mt-3 text-center text-xs font-medium text-muted-foreground underline underline-offset-2">
        Learn more about markets
      </p>
    </div>
  );
}
