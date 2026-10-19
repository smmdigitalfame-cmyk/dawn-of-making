import { Plus, Send, Sparkles } from "lucide-react";
import { useState } from "react";

export function AskBox() {
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
        Good evening, let&apos;s get started!
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
          <Sparkles className="h-5 w-5 text-muted-foreground" />
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
