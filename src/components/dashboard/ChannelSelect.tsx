import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDashboard } from "@/lib/dashboard-store";
import { cn } from "@/lib/utils";

const CHANNELS = ["All channels", "Online Store", "Point of Sale", "Social"];

export function ChannelSelect() {
  const { channel, setChannel } = useDashboard();
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
        {channel}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="fixed left-1/2 z-30 mt-2 max-h-[calc(100dvh-7rem)] w-52 max-w-[calc(100vw-2rem)] -translate-x-1/2 overflow-y-auto overscroll-contain rounded-xl border border-border bg-popover p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150 sm:absolute sm:left-0 sm:translate-x-0">
          {CHANNELS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setChannel(c);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] transition-colors hover:bg-muted",
                c === channel && "bg-muted font-semibold",
              )}
            >
              <span className="w-4">
                {c === channel && <Check className="h-4 w-4" />}
              </span>
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
