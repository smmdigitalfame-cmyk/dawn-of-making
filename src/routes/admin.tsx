import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Package, Plus, Send, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { pushScheduleDelays, type PushScheduleMode } from "@/lib/admin-store";
import { adminLogout, getAdminSession, sendAdminPush } from "@/lib/admin.functions";
import {
  ADMIN_CHANNELS,
  loadAdminData,
  newId,
  orderPushText,
  saveAdminData,
  type AdminData,
} from "@/lib/admin-store";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const s = await getAdminSession();
    if (!s.authenticated) throw redirect({ to: "/admin-login" });
  },
  head: () => ({
    meta: [
      { title: "Admin panel — Dawn of Making" },
      { name: "description", content: "Send order push notifications and manage products." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Tab = "push" | "products";

function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("push");
  const [data, setData] = useState<AdminData>(() => loadAdminData());

  // Push form
  const [productId, setProductId] = useState<string>(data.products[0]?.id ?? "");
  const [items, setItems] = useState(1);
  const [amount, setAmount] = useState<string>(data.products[0]?.price.toFixed(2) ?? "");
  const [channel, setChannel] = useState<string>(ADMIN_CHANNELS[0]);
  const [pushMsg, setPushMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [count, setCount] = useState(1);
  const [mode, setMode] = useState<PushScheduleMode>("now");
  const [minutes, setMinutes] = useState(5);
  const dataRef = useRef(data);
  const stopRef = useRef(false);

  // Product form
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const product = data.products.find((p) => p.id === productId) ?? data.products[0];
  const amountNum = Number(amount) || 0;
  const preview = orderPushText(data.nextOrderNumber, items, amountNum, channel);

  const salesRows = useMemo(() => {
    const byProduct = new Map<string, { count: number; total: number }>();
    for (const s of data.sales) {
      const row = byProduct.get(s.productName) ?? { count: 0, total: 0 };
      row.count += 1;
      row.total += s.amountUsd;
      byProduct.set(s.productName, row);
    }
    return byProduct;
  }, [data.sales]);

  function update(next: AdminData) {
    setData(next);
    saveAdminData(next);
  }

  function pickProduct(id: string) {
    setProductId(id);
    const p = data.products.find((x) => x.id === id);
    if (p) setAmount(p.price.toFixed(2));
  }

  dataRef.current = data;

  async function sendOne() {
    const cur = dataRef.current;
    const text = orderPushText(cur.nextOrderNumber, items, amountNum, channel);
    const r = await sendAdminPush({ data: text });
    const next: AdminData = {
      ...cur,
      nextOrderNumber: cur.nextOrderNumber + 1,
      sales: [
        {
          id: newId(),
          orderNumber: cur.nextOrderNumber,
          productName: product!.name,
          items,
          amountUsd: amountNum,
          channel,
          createdAt: Date.now(),
        },
        ...cur.sales,
      ],
    };
    dataRef.current = next;
    update(next);
    return r;
  }

  async function sendPush() {
    if (!product || amountNum <= 0 || items < 1) return;
    setSending(true);
    setPushMsg(null);
    stopRef.current = false;
    const delays = pushScheduleDelays(count, mode, minutes);
    let sent = 0;
    try {
      for (let i = 0; i < delays.length; i++) {
        const wait = delays[i] ?? 0;
        if (wait > 0) {
          setPushMsg(`Sent ${sent} of ${delays.length}. Next in ${Math.round(wait / 1000)} sec… (keep this page open)`);
          const end = Date.now() + wait;
          while (Date.now() < end && !stopRef.current) await new Promise((res) => setTimeout(res, 250));
        }
        if (stopRef.current) break;
        const r = await sendOne();
        sent++;
        if (r.devices === 0) {
          setPushMsg("No phone is registered yet. Turn on phone notifications from the dashboard first.");
          return;
        }
        setPushMsg(`Sent ${sent} of ${delays.length} notification(s) to ${r.sent} of ${r.devices} phone(s).`);
      }
      if (stopRef.current) setPushMsg(`Stopped. ${sent} of ${delays.length} sent.`);
    } catch (e) {
      setPushMsg(e instanceof Error ? e.message : "Could not send the notification.");
    } finally {
      setSending(false);
    }
  }

  function addProduct() {
    const price = Number(newPrice);
    if (!newName.trim() || !(price > 0)) return;
    const p = { id: newId(), name: newName.trim(), price };
    update({ ...data, products: [...data.products, p] });
    setNewName("");
    setNewPrice("");
    setProductId(p.id);
    setAmount(p.price.toFixed(2));
  }

  function removeProduct(id: string) {
    const products = data.products.filter((p) => p.id !== id);
    update({ ...data, products });
    if (productId === id) {
      setProductId(products[0]?.id ?? "");
      setAmount(products[0]?.price.toFixed(2) ?? "");
    }
  }

  async function signOut() {
    await adminLogout();
    navigate({ to: "/admin-login" });
  }

  return (
    <div className="min-h-dvh bg-[#0b0d12] text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <ShieldDot />
            <span className="text-sm font-bold">Admin panel</span>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
        <div className="mx-auto flex max-w-3xl gap-2 px-4 pb-3">
          <TabButton active={tab === "push"} onClick={() => setTab("push")} icon={<Bell className="h-4 w-4" />}>
            Send notification
          </TabButton>
          <TabButton
            active={tab === "products"}
            onClick={() => setTab("products")}
            icon={<Package className="h-4 w-4" />}
          >
            Products & sales
          </TabButton>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {tab === "push" ? (
          <section className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-[#14171f] p-5">
              <h2 className="mb-4 text-base font-bold">New order notification</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="push-product" className="mb-1.5 block text-sm font-medium text-white/70">
                    Product
                  </label>
                  <select
                    id="push-product"
                    value={product?.id ?? ""}
                    onChange={(e) => pickProduct(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-white outline-none focus:border-[#52de76]/60"
                  >
                    {data.products.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#14171f]">
                        {p.name} — ${p.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="push-items" className="mb-1.5 block text-sm font-medium text-white/70">
                    Items
                  </label>
                  <input
                    id="push-items"
                    type="number"
                    min={1}
                    max={99}
                    value={items}
                    onChange={(e) => setItems(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-white outline-none focus:border-[#52de76]/60"
                  />
                </div>
                <div>
                  <label htmlFor="push-amount" className="mb-1.5 block text-sm font-medium text-white/70">
                    Amount (dollars)
                  </label>
                  <input
                    id="push-amount"
                    type="number"
                    min={0}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-white outline-none focus:border-[#52de76]/60"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="push-channel" className="mb-1.5 block text-sm font-medium text-white/70">
                    Sales channel
                  </label>
                  <select
                    id="push-channel"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-white outline-none focus:border-[#52de76]/60"
                  >
                    {ADMIN_CHANNELS.map((c) => (
                      <option key={c} value={c} className="bg-[#14171f]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/40">
                  Notification preview
                </p>
                <p className="text-sm font-semibold text-white">{preview.title}</p>
                {preview.body.split("\n").map((line) => (
                  <p key={line} className="text-sm text-white/80">
                    {line}
                  </p>
                ))}
              </div>

              {pushMsg && (
                <p role="status" className="mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
                  {pushMsg}
                </p>
              )}

              <button
                onClick={sendPush}
                disabled={sending || !product || amountNum <= 0}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1ed149] py-2.5 text-sm font-bold text-black transition hover:bg-[#52de76] disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending…" : "Send push notification"}
              </button>
            </div>
          </section>
        ) : (
          <section className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-[#14171f] p-5">
              <h2 className="mb-4 text-base font-bold">Add product</h2>
              <div className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Product name"
                  aria-label="Product name"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-white outline-none focus:border-[#52de76]/60"
                />
                <input
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="Price ($)"
                  aria-label="Price in dollars"
                  type="number"
                  min={0}
                  step="0.01"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-white outline-none focus:border-[#52de76]/60"
                />
                <button
                  onClick={addProduct}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-[#1ed149] px-4 py-2.5 text-sm font-bold text-black hover:bg-[#52de76]"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#14171f]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-white/40">
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Price</th>
                    <th className="px-4 py-3 font-semibold">Sold</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {data.products.map((p) => {
                    const row = salesRows.get(p.name);
                    return (
                      <tr key={p.id} className="border-b border-white/5 last:border-0">
                        <td className="px-4 py-3 font-medium">{p.name}</td>
                        <td className="px-4 py-3 text-white/70">${p.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-white/70">{row?.count ?? 0}</td>
                        <td className="px-4 py-3 text-white/70">${(row?.total ?? 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => removeProduct(p.id)}
                            aria-label={`Delete ${p.name}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/40 hover:bg-white/5 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {data.products.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-white/40">
                        No products yet. Add one above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {data.sales.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#14171f]">
                <h3 className="border-b border-white/10 px-4 py-3 text-sm font-bold">Recent notifications sent</h3>
                <ul className="divide-y divide-white/5">
                  {data.sales.slice(0, 20).map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          Order #{s.orderNumber} · {s.productName}
                        </p>
                        <p className="text-xs text-white/40">
                          {new Date(s.createdAt).toLocaleString()} · {s.channel}
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold text-[#52de76]">${s.amountUsd.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function ShieldDot() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1c2b1e]">
      <Bell className="h-4 w-4 text-[#52de76]" />
    </span>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
        active ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
