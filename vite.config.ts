// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  vite: {
    plugins: [VitePWA({
      strategies: "generateSW",
      filename: "sw.js",
      injectRegister: null,
      registerType: "autoUpdate",
      manifest: false,
      devOptions: { enabled: false },
      workbox: {
        // Only a public offline message and icons are precached: never app/account HTML.
        globPatterns: ["offline.html", "icons/*.png"],
        navigateFallback: undefined,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) => request.mode === "navigate" && !url.pathname.startsWith("/~oauth"),
            handler: "NetworkFirst",
            options: {
              cacheName: "dawn-public-navigation",
              // No existing page has this opt-in header, so account/login HTML is never cached.
              cacheableResponse: { statuses: [200], headers: { "X-PWA-Cacheable": "public" } },
              precacheFallback: { fallbackURL: "/offline.html" },
            },
          },
          {
            urlPattern: ({ request, url, sameOrigin }) => sameOrigin && ["script", "style", "font", "image"].includes(request.destination) && /^\/assets\/[^/]+-[\w-]+\.(js|css|woff2?|png|jpe?g|webp|svg)$/.test(url.pathname),
            handler: "CacheFirst",
            options: { cacheName: "dawn-hashed-assets", expiration: { maxEntries: 80, maxAgeSeconds: 2592000 }, cacheableResponse: { statuses: [200] } },
          },
        ],
      },
    })],
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
