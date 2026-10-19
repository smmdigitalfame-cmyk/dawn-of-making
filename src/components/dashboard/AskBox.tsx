import { Plus, Send } from "lucide-react";
import sidekickIcon from "@/assets/icons/home-sidekick.png.asset.json";
import { useState } from "react";
import { useDashboard } from "@/lib/dashboard-store";

export function AskBox() {
  const { t } = useDashboard();
  const [value, setValue] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);

  const ask = () => {
    if (!value.trim()) return;
    setAnswer(
      "Your store is performing well today. Sales are trending above yesterday — keep an eye on the 12+ orders waiting to be fulfilled.",
    );
    setValue("");
  };

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-foreground">
        {t("greeting")}
      </h2>
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Ask something..."
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <div className="mt-6 flex items-center justify-between">
          <img src={sidekickIcon.url} alt="" className="h-6 w-6 object-contain" />
          <div className="flex items-center gap-2">
            <button
              aria-label="Add"
              className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              aria-label="Send"
              onClick={ask}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
        {answer && (
          <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-[13px] text-foreground animate-in fade-in duration-300">
            {answer}
          </p>
        )}
      </div>
    </section>
  );
}
