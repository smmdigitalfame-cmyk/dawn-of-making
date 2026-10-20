// Admin panel data: products and recorded sales, persisted to localStorage.
// Amounts are stored in US dollars (the notification format uses $).

const KEY = "dashora-admin-v1";

export interface AdminProduct {
  id: string;
  name: string;
  price: number; // USD
}

export interface AdminSale {
  id: string;
  orderNumber: number;
  productName: string;
  items: number;
  amountUsd: number;
  channel: string;
  createdAt: number;
}

export interface AdminData {
  storeName: string;
  products: AdminProduct[];
  sales: AdminSale[];
  nextOrderNumber: number;
}

export const ADMIN_CHANNELS = ["Online Store", "Facebook & Instagram", "Point of Sale"] as const;

const DEFAULT_DATA: AdminData = {
  storeName: "HoH Fashion",
  products: [
    { id: "p1", name: "Classic Hoodie", price: 70.49 },
    { id: "p2", name: "Canvas Tote Bag", price: 19.5 },
    { id: "p3", name: "Logo Cap", price: 15.0 },
    { id: "p4", name: "Graphic Tee", price: 29.68 },
    { id: "p5", name: "Ceramic Mug", price: 20.5 },
  ],
  sales: [],
  nextOrderNumber: 614,
};

export function loadAdminData(): AdminData {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw) as Partial<AdminData>;
    return {
      storeName: typeof parsed.storeName === "string" && parsed.storeName ? parsed.storeName : DEFAULT_DATA.storeName,
      products: Array.isArray(parsed.products) ? parsed.products : DEFAULT_DATA.products,
      sales: Array.isArray(parsed.sales) ? parsed.sales : [],
      nextOrderNumber:
        typeof parsed.nextOrderNumber === "number" && parsed.nextOrderNumber > 0
          ? Math.floor(parsed.nextOrderNumber)
          : DEFAULT_DATA.nextOrderNumber,
    };
  } catch {
    return DEFAULT_DATA;
  }
}

export function saveAdminData(data: AdminData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(data));
}

/**
 * Shopify-style order push, matching the reference screenshot:
 *   title: "Order #617"
 *   body:  "from Shopify\n1752.00 USD, 8 items from Online Store"
 */
export function orderPushText(
  orderNumber: number,
  items: number,
  amountUsd: number,
  channel: string,
): { title: string; body: string } {
  const noun = items === 1 ? "item" : "items";
  return {
    title: `Order #${orderNumber}`,
    body: `from Shopify\n${amountUsd.toFixed(2)} USD, ${items} ${noun} from ${channel}`,
  };
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export type PushScheduleMode = "now" | "timed" | "random";

/** Wait (ms) before each notification. "timed" spreads `count` evenly across `minutes`; "random" waits 1–4 seconds each. */
export function pushScheduleDelays(
  count: number,
  mode: PushScheduleMode,
  minutes: number,
  rand: () => number = Math.random,
): number[] {
  const n = Math.max(1, Math.floor(count));
  return Array.from({ length: n }, (_, i) => {
    if (i === 0 || mode === "now") return 0;
    if (mode === "random") return (1 + Math.floor(rand() * 4)) * 1000;
    return Math.round((Math.max(0, minutes) * 60000) / n);
  });
}
