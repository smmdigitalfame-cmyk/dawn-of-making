# Responsive optimization
- [x] Inspect existing pages and shared controls.
- [x] Apply minimal viewport-fit and responsive layout fixes.
- [x] Verify requested widths, navigation, dialogs, forms and desktop consistency.

# Android installation
- [ ] Build an APK with native, app-attributed order notifications while keeping browser push unchanged — investigate native delivery configuration and obtain required connection approval; verify on a real Android phone before claiming success.
- [ ] Remove website-origin attribution from Android notifications — uploaded APK has delegation enabled and app label Shopify; blocked on PWABuilder Android source ZIP for app-side notification handling and real-phone verification, not a website or signing mismatch.
- [x] Update installed app icons from the existing Shopify bag artwork.
- [ ] Phone push without Firebase: built on Lovable Cloud — blocked only on publish + test on a real Android phone
- [x] Audit the live website and existing backend.
- [x] Add minimal manifest, icons and privacy-safe offline fallback.
- [x] Verify preview installation metadata and preserve existing sign-in/navigation.
- [ ] Verify production worker/offline behavior — blocked until the updated website is published.
- [ ] Generate PWABuilder AAB/APK — blocked by live publication and Android signing setup.
- [x] Deploy Digital Asset Links with real package ID and signing fingerprint — on-device full-screen check still pending.
# Admin panel
- [x] Admin login page (/admin-login) with ID/password, separate admin session.
- [x] Admin panel (/admin): send Shopify-format order push with product, items, dollar amount, channel.
- [x] Products & sales tab: add/delete products, sold count and dollar totals per product.
- [x] Real phone delivery check — 5 order-format pushes sent from server, all accepted (HTTP 201) by the push service for the registered phone.
- [x] Auto "Allow notifications" prompt on app open (one-time banner, user gesture).
- [ ] URL bar hide on installed APK — website side verified by Google; needs APK signing fingerprint to match assetlinks.json (user-side check).
