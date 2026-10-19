import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CURRENCIES,
  customizeSeries,
  getCurrency,
  getMetricSeries,
  translate,
  type Language,
  type MetricKey,
  type MetricSeries,
  type RangeKey,
} from "./dashboard-data";

export interface NotificationSettings {
  storeName: string;
  intervalSec: number;
  randomInterval: boolean;
  perInterval: number;
  fastBanner: boolean;
  running: boolean;
}

export interface CustomSettings {
  language: Language;
  storeName: string;
  profileName: string;
  initials: string;
  logo: string | null;
  badgeColor: string;
  roundInitial: string;
  roundColor: string;
  visits: number | null;
  visitors: number;
  totalSales: number | null;
  orders: number | null;
  conversion: number | null;
  pendingOrders: number;
  highRisk: number;
  payout: number;
  /** Per-range override of the Total sales chart points. */
  chartValues: Partial<Record<RangeKey, number[]>>;
}

export const DEFAULT_CUSTOM: CustomSettings = {
  language: "en",
  storeName: "Shopify",
  profileName: "Dashora",
  initials: "RD",
  logo: null,
  badgeColor: "#38b2c8",
  roundInitial: "D",
  roundColor: "#3b4fd0",
  visits: null,
  visitors: 94,
  totalSales: null,
  orders: null,
  conversion: null,
  pendingOrders: 12,
  highRisk: 3,
  payout: 50000,
  chartValues: {},
};

export interface LiveBanner {
  id: number;
  title: string;
  amount: string;
}

interface DashboardState {
  range: RangeKey;
  setRange: (r: RangeKey) => void;
  channel: string;
  setChannel: (c: string) => void;
  metric: MetricKey;
  setMetric: (m: MetricKey) => void;
  currency: string;
  setCurrency: (c: string) => void;
  visitors: number;
  payoutINR: number;
  notif: NotificationSettings;
  updateNotif: (patch: Partial<NotificationSettings>) => void;
  banners: LiveBanner[];
  dismissBanner: (id: number) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  custom: CustomSettings;
  updateCustom: (patch: Partial<CustomSettings>) => void;
  editorOpen: boolean;
  setEditorOpen: (open: boolean) => void;
  t: (key: string) => string;
  seriesFor: (metric: MetricKey) => MetricSeries;
}

const DashboardContext = createContext<DashboardState | null>(null);

const STORAGE_KEY = "dashora-dashboard-v1";

const DEFAULT_NOTIF: NotificationSettings = {
  storeName: "Dashora",
  intervalSec: 2,
  randomInterval: false,
  perInterval: 1,
  fastBanner: true,
  running: false,
};

interface Persisted {
  range: RangeKey;
  channel: string;
  metric: MetricKey;
  currency: string;
  notif: NotificationSettings;
  custom: CustomSettings;
}

function loadPersisted(): Partial<Persisted> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<Persisted>;
  } catch {
    return {};
  }
}

const FIRST_NAMES = [
  "Aarav", "Priya", "Youssef", "Fatima", "Rohan", "Sara", "Omar", "Isha",
  "Karan", "Lina", "Vikram", "Noor", "Adil", "Meera", "Zayn", "Anaya",
];

const PRODUCTS = [
  "Classic Hoodie", "Leather Wallet", "Ceramic Mug", "Sneakers Pro",
  "Silk Scarf", "Denim Jacket", "Smart Watch Band", "Canvas Tote",
];

export function DashboardProvider({ children }: { children: ReactNode }) {
  const persisted = useMemo(loadPersisted, []);
  const [range, setRange] = useState<RangeKey>(persisted.range ?? "today");
  const [channel, setChannel] = useState(persisted.channel ?? "All channels");
  const [metric, setMetric] = useState<MetricKey>(persisted.metric ?? "sales");
  const [currency, setCurrency] = useState(persisted.currency ?? "INR");
  const [notif, setNotif] = useState<NotificationSettings>({
    ...DEFAULT_NOTIF,
    ...persisted.notif,
    running: false,
  });
  const [custom, setCustom] = useState<CustomSettings>({
    ...DEFAULT_CUSTOM,
    ...persisted.custom,
  });
  const [editorOpen, setEditorOpen] = useState(false);
  const updateCustom = useCallback((patch: Partial<CustomSettings>) => {
    setCustom((prev) => ({ ...prev, ...patch }));
  }, []);
  const [banners, setBanners] = useState<LiveBanner[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bannerId = useRef(0);
  const orderNo = useRef(1041);

  // Persist preferences (never persist the running flag).
  useEffect(() => {
    try {
      const payload: Persisted = {
        range,
        channel,
        metric,
        currency,
        notif: { ...notif, running: false },
        custom,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // storage unavailable — ignore
    }
  }, [range, channel, metric, currency, notif, custom]);

  const dismissBanner = useCallback((id: number) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const pushBanner = useCallback(() => {
    const name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    const amountINR = 499 + Math.floor(Math.random() * 4500);
    const cur = getCurrency(currency);
    const converted = Math.round(amountINR * cur.rateFromINR * 100) / 100;
    orderNo.current += 1;
    const banner: LiveBanner = {
      id: ++bannerId.current,
      title: `${name} ordered ${product}`,
      amount: `${converted.toLocaleString("en-US")} ${cur.symbol} · Order #${orderNo.current}`,
    };
    setBanners((prev) => [...prev.slice(-3), banner]);
    window.setTimeout(() => dismissBanner(banner.id), 4000);
  }, [currency, dismissBanner]);

  // Live notification loop.
  useEffect(() => {
    if (!notif.running) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (cancelled) return;
      for (let i = 0; i < Math.max(1, notif.perInterval); i++) {
        window.setTimeout(() => {
          if (!cancelled) pushBanner();
        }, notif.fastBanner ? i * 120 : i * 600);
      }
      const base = Math.max(1, notif.intervalSec) * 1000;
      const delay = notif.randomInterval
        ? base * (0.5 + Math.random())
        : base;
      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, notif.fastBanner ? 150 : 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [notif.running, notif.intervalSec, notif.randomInterval, notif.perInterval, notif.fastBanner, pushBanner]);

  const updateNotif = useCallback((patch: Partial<NotificationSettings>) => {
    setNotif((prev) => ({ ...prev, ...patch }));
  }, []);

  const value: DashboardState = {
    range,
    setRange,
    channel,
    setChannel,
    metric,
    setMetric,
    currency,
    setCurrency,
    visitors: custom.visitors,
    payoutINR: custom.payout,
    notif,
    updateNotif,
    banners,
    dismissBanner,
    sidebarOpen,
    setSidebarOpen,
    custom,
    updateCustom,
    editorOpen,
    setEditorOpen,
    t: (key: string) => translate(custom.language, key),
    seriesFor: (m: MetricKey) => {
      const base = getMetricSeries(m, range);
      const target =
        m === "sales" ? custom.totalSales
        : m === "visits" ? custom.visits
        : m === "orders" ? custom.orders
        : custom.conversion;
      const chart = m === "sales" ? custom.chartValues[range] ?? null : null;
      return customizeSeries(base, m, target, chart);
    },
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardState {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}

export { CURRENCIES };
