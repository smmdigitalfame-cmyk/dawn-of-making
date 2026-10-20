<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Dashboard state (date range, channel, active metric, currency, notification settings) lives in `src/lib/dashboard-store.tsx` (React context persisted to localStorage); all chart/currency math is pure functions in `src/lib/dashboard-data.ts` so rules stay unit-testable — keep new dashboard logic there, not in components.
- App pages live under `src/routes/_app/` (sidebar+topbar layout); `/` redirects to `/home`. Money is stored as INR and converted at display time via `formatMoney`/`convertFromINR`.
- User customizations (pencil editor: names, logo, badge colors, language, number/chart overrides) live in `custom` in dashboard-store; series overrides go through pure `customizeSeries` and labels through `translate` in dashboard-data — read metrics via `seriesFor`, never `getMetricSeries` directly in home components.
- Responsive layouts use shrink-safe grid/flex tracks in existing components and shared viewport/safe-area rules in `src/styles.css`; keep desktop tokens and backend workflows unchanged to preserve the existing design.
- PWA uses a static manifest and vite-plugin-pwa generateSW registered only through pwa-register; cache only the public offline page/icons and hashed assets, never account HTML or API responses, so installation preserves authentication and privacy.
- Phone push uses standard Web Push (VAPID, WebCrypto in src/lib/webpush.server.ts) with subscriptions in the push_subscriptions table (service-role only, writes gated by the dashboard session cookie); the push handler is importScripts-ed into the app worker so it only works in the published/installed app.
