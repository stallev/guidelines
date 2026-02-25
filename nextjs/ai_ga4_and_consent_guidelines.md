# Next.js GA4 and Consent (GDPR/CCPA) Guidelines

## Document Version: 1.0

**Creation Date:** February 2026  
**Project:** plumb_sm  
**Technologies:** Next.js 16 (App Router), React 19, @next/third-parties, TypeScript

> [!NOTE]
> This guideline describes how Google Analytics 4 (GA4) is integrated and how cookie/analytics consent (GDPR/CCPA) is implemented. When changing analytics or consent flows, follow this document and verify against [Next.js Script](https://nextjs.org/docs/app/api-reference/components/script) and [Optimizing Scripts](https://nextjs.org/docs/app/guides/scripts).

---

## 1. Overview

- **GA4** is loaded only after user consent; the measurement tag is not rendered and `gtag('config', ...)` is not called until the user accepts.
- **Consent** is collected via a banner (Accept / Reject); the choice is stored in a cookie so the banner is not shown again and GA is not loaded on reject.
- **Loading strategy**: Analytics script is loaded after hydration (equivalent to `afterInteractive`), so it does not block FCP/LCP.

---

## 2. GA4 Tag and Configuration

### 2.1. Measurement ID

- **Config file**: `src/config/analytics.ts`
- **Constant**: `GA_MEASUREMENT_ID` — value from `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID` or fallback (e.g. `G-2SMN1RFKNL`).
- **Override**: Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in `.env.local` for different environments. Set to `"off"` or leave unset to disable GA and the consent banner (see ConsentGate).

### 2.2. How GA4 Is Loaded

- **Package**: `@next/third-parties` (same major version as Next.js).
- **Component**: `GoogleAnalytics` from `@next/third-parties/google`; it injects gtag with an optimized loading strategy (after interactive).
- **Placement**: GA is **not** rendered directly in the root layout. It is rendered only inside the **ConsentGate** client component when consent is `accepted` (see below).

### 2.3. Root Layout

- In `src/app/layout.tsx`, the layout renders `<ConsentGate />` (not `<GoogleAnalytics />` directly). ConsentGate decides whether to show the banner, GA, or nothing.

---

## 3. Consent (GDPR/CCPA) Architecture

### 3.1. Flow

1. **First visit (no cookie)**: ConsentGate shows the ConsentBanner. User clicks Accept or Reject.
2. **Accept**: Cookie is set (`cookie_consent=accepted`), banner is hidden, ConsentGate renders `<GoogleAnalytics gaId={GA_MEASUREMENT_ID} />` so gtag loads and runs.
3. **Reject**: Cookie is set (`cookie_consent=rejected`), banner is hidden, ConsentGate renders nothing — no GA script, no gtag config.
4. **Return visit**: ConsentGate reads the cookie on mount; if `accepted`, it renders GA (no banner); if `rejected`, it renders nothing (no banner).

### 3.2. Config and Cookie

- **Config**: `src/config/consent.ts`
  - `CONSENT_COOKIE_NAME`: cookie name (e.g. `cookie_consent`).
  - `CONSENT_VALUE.accepted` / `CONSENT_VALUE.rejected`: allowed values.
  - `CONSENT_COOKIE_MAX_AGE`: cookie lifetime in seconds (e.g. 1 year).
- **Helpers**: `src/lib/consent.ts` (client-only)
  - `getConsentFromCookie(): 'accepted' | 'rejected' | null` — reads `document.cookie`.
  - `setConsentCookie(value: 'accepted' | 'rejected'): void` — sets cookie with `path=/`, `max-age`, `SameSite=Lax`.
  - Both guard with `typeof document !== 'undefined'`; call from `useEffect` or event handlers only.

### 3.3. ConsentGate (Client Component)

- **File**: `src/components/shared/ConsentGate/ConsentGate.tsx`
- **Role**: Single client island that (1) reads consent from cookie on mount, (2) shows ConsentBanner when consent is pending, (3) renders GoogleAnalytics only when consent is accepted, (4) renders nothing when rejected or when GA is disabled.
- **State**: `consent: 'pending' | 'accepted' | 'rejected'`. Initial `pending`; after mount, `useEffect` reads cookie and updates state (e.g. via `queueMicrotask` to satisfy lint rules).
- **GA disabled**: If `!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'off'`, ConsentGate returns `null` (no banner, no GA).

### 3.4. ConsentBanner (Client Component)

- **File**: `src/components/shared/ConsentBanner/ConsentBanner.tsx`
- **Props**: `onAccept`, `onReject` (callbacks).
- **UI**: Fixed bar at bottom; short text about cookies/analytics; link to Privacy Policy (`RoutePath.privacy`); "Reject" and "Accept" buttons.
- **A11y**: `role="region"`, `aria-label="Cookie consent"`; button `aria-label`s for Accept/Reject.

---

## 4. File Reference

| Purpose              | File |
|----------------------|------|
| GA measurement ID    | `src/config/analytics.ts` |
| Consent cookie config| `src/config/consent.ts` |
| Cookie get/set       | `src/lib/consent.ts` |
| Banner UI            | `src/components/shared/ConsentBanner/ConsentBanner.tsx` |
| Gate (banner + GA)   | `src/components/shared/ConsentGate/ConsentGate.tsx` |
| Layout usage         | `src/app/layout.tsx` (renders `<ConsentGate />`) |

---

## 5. Rules for Changes

### 5.1. Adding or Changing GA

- Keep using `@next/third-parties` `GoogleAnalytics`; do not add raw gtag script tags in layout.
- Keep GA behind ConsentGate so it only loads when consent is `accepted`.
- ID remains configurable via `NEXT_PUBLIC_GA_MEASUREMENT_ID`.

### 5.2. Changing Consent Behavior

- Cookie name and values: change only in `src/config/consent.ts` and keep `src/lib/consent.ts` in sync.
- To support more granular consent (e.g. analytics vs marketing): extend cookie values or use a JSON object in one cookie; update ConsentGate and banner to read/write and pass options into GA (e.g. Consent Mode v2) if needed.
- Banner text and link: update `ConsentBanner`; keep a link to the Privacy Policy.

### 5.3. SEO and Performance

- GA and the consent banner do not change server-rendered HTML content; they do not affect indexing.
- Script load remains deferred (after interactive), so FCP/LCP are not blocked by analytics.

---

## 6. Verification Checklist

- First visit: banner visible; after Accept, banner disappears and request to `googletagmanager.com` appears in Network; after Reject, banner disappears and no gtag request.
- After reload with prior Accept: no banner, GA loads. With prior Reject: no banner, no GA.
- With `NEXT_PUBLIC_GA_MEASUREMENT_ID=off` or unset (and no fallback ID): no banner, no GA.
- `npx tsc --noEmit`, `npm run lint`, `npm run build` pass.

---

**Last Updated:** February 2026  
**Next.js Version:** 16.x  
**Related:** [Next.js Script](https://nextjs.org/docs/app/api-reference/components/script), [Optimizing Scripts](https://nextjs.org/docs/app/guides/scripts)
