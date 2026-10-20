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
    };
  } catch {
    return DEFAULT_DATA;
  }
}

export function saveAdminData(data: AdminData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(data));
}

/** Shopify-style order push body: "HoH Fashion has a new order for 2 items totaling $70.49 from Online Store." */
export function orderPushBody(storeName: string, items: number, amountUsd: number, channel: string): string {
  const noun = items === 1 ? "item" : "items";
  return `${storeName} has a new order for ${items} ${noun} totaling $${amountUsd.toFixed(2)} from ${channel}.`;
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
