import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import {
  BADGE_COLORS,
  LANGUAGES,
  badgeTextColor,
  getMetricSeries,
  type Language,
} from "@/lib/dashboard-data";
import { useDashboard, type CustomSettings } from "@/lib/dashboard-store";
import { cn } from "@/lib/utils";
import bagLogo from "@/assets/bag-logo.png.asset.json";

const fieldCls =
  "w-full rounded-lg border border-editor-border bg-editor-field px-3.5 py-2.5 text-sm font-medium text-editor-foreground focus:outline-none focus:ring-2 focus:ring-editor-border";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-semibold text-editor-foreground">{label}</span>
      {children}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  step = "any",
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  step?: string;
}) {
  return (
    <input
      type="number"
      step={step}
      className={fieldCls}
      value={value === null ? "" : value}
      onChange={(e) => {
        const raw = e.target.value;
        onChange(raw === "" ? null : Number(raw));
      }}
    />
  );
}

function Swatches({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (c: string) => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {BADGE_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={`${label} ${c}`}
          onClick={() => onChange(c)}
          style={{ backgroundColor: c }}
          className={cn(
            "h-6 w-6 rounded-full transition-transform hover:scale-110",
            value === c && "ring-2 ring-editor-foreground ring-offset-2 ring-offset-editor",
          )}
        />
      ))}
    </div>
  );
}

export function CustomizeDialog() {
  const { editorOpen, setEditorOpen, custom, updateCustom, seriesFor, range } = useDashboard();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editorOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setEditorOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editorOpen, setEditorOpen]);

  if (!editorOpen) return null;

  const set = <K extends keyof CustomSettings>(k: K, v: CustomSettings[K]) =>
    updateCustom({ [k]: v } as Partial<CustomSettings>);

  const salesBase = getMetricSeries("sales", range);
  const chart = custom.chartValues[range];
  const chartAt = (i: number) =>
    chart?.[i] ?? Math.round(salesBase.points[i]?.current ?? 0);

  const setChartAt = (i: number, v: number | null) => {
    const next = salesBase.points.map((_, j) => chartAt(j));
    next[i] = v ?? Math.round(salesBase.points[i]?.current ?? 0);
    updateCustom({ chartValues: { ...custom.chartValues, [range]: next } });
  };

  const onLogo = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" && set("logo", reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        aria-label="Close editor"
        className="fade-in-bg absolute inset-0 bg-foreground/60"
        onClick={() => setEditorOpen(false)}
      />
      <div
        role="dialog"
        aria-label="Customize dashboard"
        className="editor-in relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-editor-border bg-editor text-editor-foreground shadow-2xl"
      >
        <button
          aria-label="Close"
          onClick={() => setEditorOpen(false)}
          className="absolute right-4 top-4 z-10 rounded-full bg-editor-foreground/10 p-1.5 hover:bg-editor-foreground/20"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-5 overflow-y-auto px-4 py-6 sm:px-6">
          <h2 className="text-center text-3xl font-black tracking-tight">DASHORA</h2>

          <Field label="Language">
            <select
              className={fieldCls}
              value={custom.language}
              onChange={(e) => set("language", e.target.value as Language)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </Field>

          <section className="flex flex-col gap-4 rounded-xl border border-editor-border/60 p-4">
            <p className="text-sm font-medium text-editor-muted">Store settings</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Store name (left)">
                <input className={fieldCls} value={custom.storeName} onChange={(e) => set("storeName", e.target.value)} />
              </Field>
              <Field label="Profile name (right)">
                <input className={fieldCls} value={custom.profileName} onChange={(e) => set("profileName", e.target.value)} />
              </Field>
              <Field label="Initials">
                <input className={fieldCls} maxLength={3} value={custom.initials} onChange={(e) => set("initials", e.target.value.toUpperCase())} />
              </Field>
            </div>

            <Field label="Store logo">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-3 rounded-xl border border-editor-border bg-editor-field px-3 py-2.5 text-sm font-semibold hover:bg-editor-foreground/10"
                >
                  <img src={custom.logo ?? bagLogo.url} alt="Store logo" className="h-7 w-7 object-contain" />
                  Choose image
                </button>
                {custom.logo && (
                  <button type="button" onClick={() => set("logo", null)} className="text-xs text-editor-muted underline">
                    Reset
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onLogo(e.target.files?.[0])} />
              </div>
            </Field>

            <Field label="Badge color">
              <Swatches label="Badge color" value={custom.badgeColor} onChange={(c) => set("badgeColor", c)} />
            </Field>
            <p className="flex items-center gap-2 text-[13px] text-editor-muted">
              Preview:
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold"
                style={{ backgroundColor: custom.badgeColor, color: badgeTextColor(custom.badgeColor) }}
              >
                {custom.initials}
              </span>
              <span className="font-semibold text-editor-foreground">{custom.storeName}</span>
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Round badge initial">
                <input className={fieldCls} maxLength={2} value={custom.roundInitial} onChange={(e) => set("roundInitial", e.target.value.toUpperCase())} />
              </Field>
              <Field label="Round badge color">
                <Swatches label="Round badge color" value={custom.roundColor} onChange={(c) => set("roundColor", c)} />
              </Field>
            </div>
            <p className="flex items-center gap-2 text-[13px] text-editor-muted">
              Round preview:
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                style={{ backgroundColor: custom.roundColor, color: badgeTextColor(custom.roundColor) }}
              >
                {custom.roundInitial}
              </span>
            </p>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Visits">
              <NumberInput value={custom.visits ?? seriesFor("visits").total} onChange={(v) => set("visits", v)} />
            </Field>
            <Field label="Visitors online">
              <NumberInput value={custom.visitors} onChange={(v) => set("visitors", v ?? 0)} step="1" />
            </Field>
          </div>
          <Field label="Total sales">
            <NumberInput value={custom.totalSales ?? seriesFor("sales").total} onChange={(v) => set("totalSales", v)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Orders">
              <NumberInput value={custom.orders ?? seriesFor("orders").total} onChange={(v) => set("orders", v)} step="1" />
            </Field>
            <Field label="Conversion rate (%)">
              <NumberInput value={custom.conversion ?? seriesFor("conversion").total} onChange={(v) => set("conversion", v)} />
            </Field>
            <Field label="Pending orders">
              <NumberInput value={custom.pendingOrders} onChange={(v) => set("pendingOrders", v ?? 0)} step="1" />
            </Field>
            <Field label="High risk orders">
              <NumberInput value={custom.highRisk} onChange={(v) => set("highRisk", v ?? 0)} step="1" />
            </Field>
          </div>
          <Field label="Next payout">
            <NumberInput value={custom.payout} onChange={(v) => set("payout", v ?? 0)} />
          </Field>

          <fieldset className="rounded-xl border border-editor-border/60 p-4">
            <legend className="px-2 text-sm font-semibold">Chart values — current period</legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {salesBase.points.map((p, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-editor-muted">{p.label}</span>
                  <NumberInput value={chartAt(i)} onChange={(v) => setChartAt(i, v)} />
                </div>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            onClick={() => updateCustom({ visits: null, totalSales: null, orders: null, conversion: null, chartValues: {} })}
            className="self-start text-xs text-editor-muted underline"
          >
            Reset numbers to automatic
          </button>
        </div>
      </div>
    </div>
  );
}
