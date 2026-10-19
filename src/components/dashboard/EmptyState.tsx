import { Search, type LucideIcon } from "lucide-react";

export function EmptyState({
  title,
  searchPlaceholder,
  icon: Icon,
  emptyTitle,
  emptySubtitle,
  actionLabel,
  secondaryLabel,
  learnMore,
}: {
  title: string;
  searchPlaceholder: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptySubtitle: string;
  actionLabel: string;
  secondaryLabel?: string;
  learnMore: string;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-border bg-muted px-3 py-1.5 text-[13px] font-medium text-foreground hover:bg-muted/70">
            Export
          </button>
          {secondaryLabel && (
            <button className="rounded-lg bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90">
              {secondaryLabel}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder={searchPlaceholder}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <div className="flex flex-col items-center gap-2 px-6 py-20 text-center">
          <Icon className="h-12 w-12 text-foreground" strokeWidth={1.2} />
          <p className="text-sm font-semibold text-foreground">{emptyTitle}</p>
          <p className="text-[13px] text-muted-foreground">{emptySubtitle}</p>
          <button className="mt-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:bg-primary/90">
            {actionLabel}
          </button>
        </div>
      </div>
      <p className="mt-3 text-center text-xs font-medium text-muted-foreground underline underline-offset-2">
        {learnMore}
      </p>
    </div>
  );
}
