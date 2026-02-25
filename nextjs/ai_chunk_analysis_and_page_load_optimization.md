# Next.js Chunk Analysis and Page Load Optimization

## Document Version: 1.0

**Creation Date:** February 2026  
**Project:** plumb_sm  
**Technologies:** Next.js 16 (App Router), React 19, TypeScript

This guideline describes how to analyze JavaScript chunks (including when you have links to chunk files) and how to optimize page load when PageSpeed Insights or Lighthouse report "Remove unused JavaScript". Use it when investigating heavy chunks or improving initial load metrics.

> [!NOTE]
> Chunk hashes (e.g. `dbe19f4b07cc6d7a.js`) change between builds. This document explains how to determine chunk *roles* and which components/routes they serve; for exact module contents, use [@next/bundle-analyzer](https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer) or source maps.

---

## 1. Purpose

- **Analyze chunks** using links to chunk files you provide (e.g. `_next/static/chunks/<hash>.js`), build manifests, and RSC segments.
- **Optimize page load** by reducing unused JS: prefetch only on hover/focus for heavy routes, dynamic imports for heavy layout components, and route-level code splitting.

---

## 2. Sources of Chunk Information

### 2.1. Chunk file paths

- Paths like `_next/static/chunks/dbe19f4b07cc6d7a.js` or `1949bdd2d71d6b2f.js` identify a specific build output. The hash is content-based and changes every build.
- You cannot tell exact module contents from the filename alone; you use it to **search** the build output and RSC payloads.

### 2.2. build-manifest.json

- Location: `.next/build-manifest.json` (after `next build`).
- **`rootMainFiles`**: list of chunk filenames loaded on **every** page (framework + shared layout client code). If your chunk hash appears here, it is part of the root bundle.
- Example:
  ```json
  "rootMainFiles": [
    "static/chunks/3f4252ffbf00724d.js",
    "static/chunks/1949bdd2d71d6b2f.js",
    ...
  ]
  ```

### 2.3. RSC segments

- Location: `.next/server/app/**/*.segment.rsc` (App Router).
- These files reference chunk paths and **client component names** (e.g. `ContactForm`, `EmergencyOrderForm`, `ServiceCardImage`). Search by chunk hash to see which routes use that chunk.
- Example: a line containing `dbe19f4b07cc6d7a.js` and `"EmergencyOrderForm"` indicates that chunk is used on the route that segment belongs to (e.g. `/emergency` or `/contact`).

### 2.4. Searching by chunk hash

- From the project root, search under `.next` for the chunk filename (e.g. `dbe19f4b07cc6d7a`):
  ```bash
  grep -r "dbe19f4b07cc6d7a" .next
  ```
- Results show which RSC segments (and thus which routes) load that chunk. Component names in the same segment line tell you what client code is in that chunk.

---

## 3. Determining Chunk Contents

- **Role from manifests/segments**: By correlating chunk hashes with `rootMainFiles` and RSC segments, you can classify a chunk as:
  - **Root main**: loaded on every page; typically React/Next runtime and layout client components (ThemeProvider, ConsentGate, Header, Footer).
  - **Page/route-specific**: loaded only for certain routes; segment files list the component names (e.g. forms, modals).
- **Exact module list**: Use **@next/bundle-analyzer** (see [Bundle Optimization Guidelines](./ai_bundle_analyze_steps.md)) or **source-map-explorer** with production source maps. The analyzer shows which source modules and libraries contribute to each chunk.

---

## 4. Typical Chunks in This Project

| Chunk type   | Typical contents | Optimization |
|-------------|------------------|--------------|
| **Root main** | React/Next runtime, ThemeProvider, ConsentGate (ConsentBanner, GoogleAnalytics), Header, Footer, UtilityBar | Use dynamic imports for ConsentBanner and GoogleAnalytics; keep layout client islands small. |
| **Forms chunk** | ContactForm, ServiceRequestForm, EmergencyOrderForm, react-hook-form, @hookform/resolvers, zod, form UI | Only loaded on `/contact` and `/emergency`. Do not prefetch these routes automatically; use prefetch on hover/focus only. |

---

## 5. Optimization Recommendations

### 5.1. Prefetch for heavy routes only on hover/focus

- For links to routes that pull large chunks (e.g. `/contact`, `/emergency`), disable automatic prefetch and prefetch only when the user hovers or focuses the link.
- Implementation: use `HeavyRouteLink`, `ContactLink`, or `EmergencyLink` (see project atoms). They set `prefetch={false}` on `Link` and call `router.prefetch(href)` in `onMouseEnter` and `onFocus`.
- Effect: the forms chunk is not loaded on initial page load; it loads when the user shows intent to navigate (hover/focus), keeping the first click fast while reducing unused JS on the homepage.

### 5.2. Dynamic imports for heavy layout components

- Load ConsentBanner, GoogleAnalytics, and other heavy client-only UI via `next/dynamic` with `ssr: false` so they are in separate chunks and not in the root main bundle.
- Example: ConsentGate in this project loads ConsentBanner and GoogleAnalytics dynamically.

### 5.3. Route-level code splitting

- Keep forms and other heavy interactivity only on the routes that need them. Avoid importing them in the root layout or in components that render on every page.

### 5.4. After making changes

- Run `next build`, then inspect Network (or PageSpeed) to confirm which chunks are requested on the target page (e.g. homepage).
- Optionally run the bundle analyzer to verify chunk composition.

---

## 6. Checklist When You See "Remove unused JavaScript"

1. **Identify the chunk** — Note the chunk filename (hash) from the report.
2. **Classify the chunk** — Check `build-manifest.json` for `rootMainFiles`; search `.next` for the hash to see which routes and component names reference it.
3. **Decide action**:
   - If it is a **root** chunk: move heavy parts to dynamic imports or smaller client islands.
   - If it is a **route-specific** chunk loaded on a page that doesn’t use it (e.g. forms chunk on homepage): ensure links to that route use `prefetch={false}` and prefetch only on hover/focus (e.g. ContactLink/EmergencyLink/HeavyRouteLink).
4. **Document** — When providing links to chunk files, use this guideline: search by hash → manifests/segments → components/routes → apply the optimizations above.

---

## 7. References

- [Next.js: Bundle Analyzer](https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer)
- [Next.js: Dynamic Imports / Lazy Loading](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [Next.js: Loading UI and Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- Project: [Bundle Optimization Guidelines](./ai_bundle_analyze_steps.md)
- Project: [Public Pages Optimization](./ai_public_pages_optimization.md)

---

**Version:** 1.0  
**Last Updated:** February 2026  
**Project:** plumb_sm
