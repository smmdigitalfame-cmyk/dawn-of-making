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

The real verification file is deployed at `public/.well-known/assetlinks.json` and served at **https://dawn-of-making.lovable.app/.well-known/assetlinks.json** (public, no auth, HTTP 200, `application/json`):

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "app.lovable.dawn_of_making.twa",
      "sha256_cert_fingerprints": ["0F:42:D7:B7:87:B8:CA:40:5C:E9:AD:29:87:F4:39:07:A7:A9:22:B5:13:20:E3:B7:AD:00:26:9E:59:BA:1C:A2"]
    }
  }
]
```

This configures full-screen TWA verification when the installed app's package name and signing certificate match. A visible browser toolbar can also indicate runtime verification/browser issues; it does not by itself prove a signing mismatch. With Google Play App Signing, use the **app signing certificate** SHA-256 from Play Console's App integrity section, not the upload certificate. Add both fingerprints when supporting both a directly signed APK and Play distribution. Full-screen verification is separate from notification origin attribution.

Remaining verification: install the signed APK on a real Android device and confirm the app opens full-screen without the URL bar. Until that on-device check passes, URL-hiding is configured but not confirmed.

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

### Notification attribution inspection — 20 October 2026

The user's screenshot shows the website origin above the notification title. Inspection of the uploaded `Shopify.apk` confirms application label `Shopify`, `POST_NOTIFICATIONS`, enabled/exported `app.lovable.dawn_of_making.twa.DelegationService`, the TWA service intent filter and a valid small-icon reference. `@bool/enableNotification` resolves to true. Live Digital Asset Links contains the previously supplied package and fingerprint. Therefore simply enabling delegation again or re-publishing the website does not constitute a fix for this screenshot.

The website push payload cannot control Android/browser attribution. Reinstallation and matching Digital Asset Links do not guarantee its removal. The next app-side investigation needs the PWABuilder Android source export (Include source code), preserving the package, key and existing website/account system. Inspect the delegation callback and browser-supplied notification fields, then build and test on the actual device; no changed APK or on-device fix has been verified in this investigation. Native delegation can customize a notification that reaches that callback, but cannot guarantee control over browser fallback notifications.

Official customization example: https://github.com/GoogleChrome/android-browser-helper/blob/main/demos/twa-notification-delegation/src/main/java/com/google/androidbrowserhelper/demos/twa_notification_delegation/NotificationDelegationService.java

- PWABuilder: https://www.pwabuilder.com/
- PWABuilder source: https://github.com/pwa-builder/PWABuilder
- Android Trusted Web Activities: https://developer.chrome.com/docs/android/trusted-web-activity/
- Digital Asset Links: https://developers.google.com/digital-asset-links/v1/getting-started
- Play App Signing: https://support.google.com/googleplay/android-developer/answer/9842756