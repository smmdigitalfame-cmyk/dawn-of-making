import { Calendar, Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RANGES, getRange } from "@/lib/dashboard-data";
import { useDashboard } from "@/lib/dashboard-store";
import { cn } from "@/lib/utils";

export function DateRangePicker() {
  const { range, setRange } = useDashboard();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[13px] font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
      >
        <Calendar className="h-4 w-4 text-muted-foreground" />
        {getRange(range).label}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="fixed left-1/2 z-30 mt-2 flex max-h-[calc(100dvh-7rem)] w-64 max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-col rounded-xl border border-border bg-popover p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150 sm:absolute sm:left-0 sm:translate-x-0">
          <div className="flex shrink-0 gap-1 border-b border-border pb-2">
            <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">
              Fixed
            </span>
            <span className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground">
              Rolling
            </span>
          </div>
          <div className="min-h-0 max-h-80 overflow-y-auto overscroll-contain pt-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => {
                  setRange(r.key);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] transition-colors hover:bg-muted",
                  r.key === range && "bg-muted font-semibold",
                )}
              >
                <span className="w-4">
                  {r.key === range && <Check className="h-4 w-4" />}
                </span>
                {r.label}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 justify-end gap-2 border-t border-border pt-2">
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-[13px] font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
