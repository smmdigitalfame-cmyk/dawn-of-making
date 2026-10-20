# Dawn of Making — Android packaging handoff

## Source and audit (20 October 2026)

The app source remains https://dawn-of-making.lovable.app/. No second application, database, login system or user store was created.

The live site was audited with a fresh Chromium browser. HTTPS works; `/` redirects to `/login`; there were no JavaScript page errors. At audit time there was no manifest link, theme-color tag, touch icon or registered service worker. `/manifest.webmanifest`, `/manifest.json`, `/sw.js` and `/.well-known/assetlinks.json` returned 404. Offline reload failed.

This repository is TanStack Start/React, not Laravel. Its current login uses an existing server-side credential check and signed session cookie. No Laravel API or user-database integration was found. If a different Laravel website is intended, confirm its URL before packaging; this work does not replace or migrate authentication.

## Changes prepared in this project

- Static manifest: name **Dawn of Making**, stable ID/start URL/scope `/`, standalone display, any orientation, existing dark theme and background.
- 192px, 512px, maskable 512px and Apple touch icons use the website's existing Shopify bag artwork, with safe launcher margins. The source is a small raster image; these are valid size exports, not newly drawn high-resolution artwork or a claim that this is Shopify's official app.
- Android's launch splash derives from the manifest name, icon and background. No new website splash screen or redesign.
- `vite-plugin-pwa` generates `/sw.js`. One client wrapper registers it only in published production outside preview/iframe contexts, with `?sw=off` cleanup. Messaging workers are not touched.
- A public offline page and icons are precached. Navigations are network-first; account/login HTML is not cached (only explicitly opted-in public responses could be cached). Same-origin hashed static assets may be cached. API calls, POST requests and account data are not cached by this worker. Existing application localStorage behavior is unchanged.
- OAuth navigation at `/~oauth` is excluded. No cached dashboard or offline account access is provided.

## Verification and limitations

22 automated tests passed, including worker-registration/cleanup safety. The preview served the manifest and all app icons; registered no workers; existing login succeeded; Orders navigation succeeded; offline-message rendering was inspected. Current build checks passed.

Production worker installation, production offline reload, APK/AAB installation, Android back navigation, downloads, uploads, permission prompts, signing and Digital Asset Links have **not** been verified. Preview intentionally cannot verify an installed production worker. The updated files must first be published, then `/sw.js` and the offline fallback must be tested on the live origin before packaging. No AAB/APK has been generated.

## PWABuilder packaging

1. Publish the current website changes to the same origin. Recheck that the manifest/icons, `/offline.html` and `/sw.js` are public HTTPS resources with correct content types.
2. Open https://www.pwabuilder.com/ and enter https://dawn-of-making.lovable.app/; inspect its live readiness report.
3. Choose Android packaging. Use the same start URL/scope, app name/icon/theme; do not enable notifications just because a packaging checkbox exists.
4. Select a stable Android application ID (a suggested initial ID is `app.lovable.dawnofmaking`; confirm availability and ownership). This ID must remain fixed for subsequent updates. Set initial version code/name and required Play settings in the current Android form.
5. For a new app, generate a signing key through the packaging workflow or supply a privately held existing key. If this app already exists on Play, reuse its application ID and required upload key; never replace them arbitrarily.
6. Download and securely retain the generated signing material and passwords. Do not store them in this repository, public website or chat. Keep encrypted backups. Future updates require compatible signing and increasing version codes.
7. Download the Android ZIP and confirm it contains the current workflow's AAB (Google Play) and APK (direct device testing), if offered. Hosted PWABuilder builds from the live URL, not unpublished project files. No stable supported public packaging API was confirmed, so this handoff does not call an undocumented endpoint.
8. Install the APK on a real Android device and exercise sign-in/out, refresh/session persistence, back navigation, forms, files/downloads, external links, rotation, loss/recovery of internet and app relaunch. Test the AAB through Google Play's internal testing track before release.

## Digital Asset Links and signing

Serve the following shape at **https://dawn-of-making.lovable.app/.well-known/assetlinks.json**, publicly without authentication or redirects, with HTTP 200 and `application/json`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "YOUR_FINAL_APPLICATION_ID",
      "sha256_cert_fingerprints": ["YOUR_REAL_SIGNING_CERTIFICATE_SHA256"]
    }
  }
]
```

This is a documentation template, not a deployed verification file. Do not deploy placeholders. For a directly installed APK, use its actual signing certificate SHA-256. With Google Play App Signing, use the **app signing certificate** SHA-256 shown in Play Console's App integrity section, not merely the upload certificate. Add both actual fingerprints when supporting both independently signed direct APK and Play distributions. PWABuilder may supply initial asset-links output; update it for the final Play signing certificate as needed.

Once real values are available, the file can be added at `public/.well-known/assetlinks.json` and published. Validate it against the installed application's certificate and package ID. Without a valid association, a TWA may display browser UI rather than the expected trusted full-screen experience. Additional trusted origins need their own verification.

## Push notifications

Existing notifications are timer-driven in-page simulated order banners, **not background push**. Browser Push APIs being present does not establish delivery. No messaging worker, Push subscription registration, VAPID configuration, subscription storage or server-side push delivery implementation was found. The audit browser reported notifications denied; this is that browser's state, not a universal permission setting.

Background push would require an explicit opt-in permission flow, a messaging worker, push subscriptions stored against the existing account system, private server-side sending credentials, delivery/retry/expired-subscription handling and Android foreground/background/device testing. For a Laravel source, these integrations must be implemented in its existing backend after confirming access. No push backend was added and push is not claimed to work.

The user requested real phone background push. The Firebase Messaging connection was offered but declined, so registration and delivery remain blocked. Existing in-page notifications remain unchanged.

## Outstanding blockers

- Publish the prepared PWA changes and test production offline behavior.
- Confirm the intended source if the application must use a separate Laravel backend.
- Complete PWABuilder signing/application-ID setup and download Android packages.
- Supply final signing fingerprints, publish asset links and verify on Android/Play.

## References

- PWABuilder: https://www.pwabuilder.com/
- PWABuilder source: https://github.com/pwa-builder/PWABuilder
- Android Trusted Web Activities: https://developer.chrome.com/docs/android/trusted-web-activity/
- Digital Asset Links: https://developers.google.com/digital-asset-links/v1/getting-started
- Play App Signing: https://support.google.com/googleplay/android-developer/answer/9842756