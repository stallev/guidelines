# Next.js Loading Patterns Guidelines

## Document Version: 2.1
**Creation Date:** 27 December 2025  
**Last Updated:** 23 March 2026  
**Scope:** reusable guideline for Next.js App Router projects  
**Technologies:** current stable Next.js (App Router, Server Components), React, TypeScript

> [!NOTE]
> Documentation is based on current sources:
> - current stable Next.js — official documentation
> - React 19 — official documentation  
> - shadcn/ui — official documentation  
> When implementing, verify against the latest [Next.js Loading UI and Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming) guide (includes streaming behavior, Suspense, and `loading.js`).


---

## 1. Overview

This document is the **unified guide** for loading states and fast navigation in Next.js App Router applications. It covers route-level loading, Suspense boundaries, and skeleton placeholders.

> [!IMPORTANT]
> App Router streaming (HTML + RSC payload via Suspense boundaries) is a production-ready model. Use `loading.tsx`, Suspense, and lightweight route shells for fast navigation and clear loading UX.

**Key Principle**: When a user clicks a link to navigate to a page, that page **MUST** open immediately, even if content is not yet loaded. For fastest navigation, use a **lightweight page.tsx** (and segment layout) and **Suspense around each heavy block**; skeleton placeholders should be displayed for each content block until data is ready.

### 1.1. Streaming model (how App Router delivers a page)

On a fully supported App Router deployment, React’s server renderer produces output **in chunks aligned with `<Suspense>` boundaries**. The initial navigation typically involves:

- An **HTML stream** where static parts of the UI (layouts, navigation, Suspense fallbacks) can be sent early.
- A **React Server Components (RSC) payload** stream where resolved async Server Components are streamed in when ready.

So the meaningful “unit” of progressive delivery is the **Suspense boundary** and the **RSC flight payload**, not a vague “HTTP chunked HTML” mental model alone. See the official [Loading UI and Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming) documentation.

> [!NOTE]
> **Production validation:** After changing loading/Suspense boundaries, verify navigation, skeletons, and final render in a production-like environment (network latency and cache behavior differ from localhost).

### 1.2. Architectural view: data boundaries (“senior” framing)

Treat streaming and Suspense as decisions about **where data dependencies sit**, not only as “speed tricks.” When designing a page, ask:

- **What is the shell?** Navigation, titles, layout chrome, and structure that should not wait on slow database or API calls.
- **Which data sources are independent?** Each independent source is a candidate for its own `<Suspense>` boundary (e.g. stats card vs. activity feed).
- **Where is the real bottleneck?** A single heavy `await` at the top of `page.tsx` or layout often blocks the first useful paint; moving that work behind Suspense **isolates** the slow path.

For backends such as **PostgreSQL / Neon**, independent queries can back independent Suspense regions: sections can become ready in **any order**, and the UI can reflect progress instead of a single global wait.

---

## 2. Next.js App Router Loading Mechanisms

### 2.1. loading.tsx Files

Next.js App Router automatically uses `loading.tsx` files to show loading states during navigation. These files are **special files** that Next.js recognizes and uses automatically.

**File Location**: Place `loading.tsx` in the same directory as your `page.tsx`:

```
app/
├── (private)/
│   └── grades/
│       ├── page.tsx          # Main page component
│       ├── loading.tsx        # Loading state (shown during navigation)
│       └── [gradeId]/
│           ├── page.tsx      # Detail page
│           └── loading.tsx   # Detail page loading state
```

**Automatic Behavior**:
- When user navigates to `/grades`, Next.js shows `loading.tsx` immediately
- While `page.tsx` is loading data, `loading.tsx` is displayed
- Once `page.tsx` is ready, it replaces `loading.tsx` automatically
- **Route-level Suspense is built-in:** you do **not** wrap the segment’s `page` in `<Suspense>` yourself for the same purpose—Next.js applies the [`loading.js` / `loading.tsx` convention](https://nextjs.org/docs/app/api-reference/file-conventions/loading) by wrapping the segment **in a Suspense boundary** and using your file as the **fallback** for that boundary while the segment loads.
- You **do** add **manual** `<Suspense>` boundaries **inside** `page.tsx` when you want **within-page** sections to load independently.

`loading.tsx` is shown while the **route segment** (layout + initial page render) is loading; it is the segment's first paint for that route.

**Example**:

```typescript
// app/(private)/grades/loading.tsx
import { GradeListSkeleton } from '@/components/molecules/grades/grade-list-skeleton';

/**
 * Loading state for grades list page
 * Automatically shown during navigation to /grades
 */
export default function GradesLoading() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-9 w-32 bg-muted animate-pulse rounded-md mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="h-11 w-32 bg-muted animate-pulse rounded-md" />
      </div>
      <GradeListSkeleton />
    </div>
  );
}
```

### 2.2. Suspense Boundaries

For more granular control over loading states within a page, use React Suspense boundaries.

**Anti-pattern:** A heavy `await` in `page.tsx` (or in the segment layout) delays the first server chunk and blocks the user from seeing the new route. The client cannot show the new page or any skeleton until the server sends at least one RSC chunk.

**Recommended pattern:** Move heavy data loading (and optionally auth/role checks) into **child components**; wrap each such component in `<Suspense fallback={…}>`. The page can render a lightweight shell first; subsequent RSC chunks can stream in as async children resolve (standard App Router behavior on Vercel).

**Streaming:** The first RSC chunk contains layout + lightweight page + fallback UI; subsequent chunks contain resolved async children. This allows the user to see the new route and skeletons without waiting for all data.

**Parallel boundaries:** Sibling `<Suspense>` regions (e.g. two cards or two lists) can **resolve independently**—the section whose data is ready first can stream in first. A slow block does not have to block unrelated UI behind another boundary.

```typescript
import { Suspense } from 'react';
import { GradeDetailContent } from './grade-detail-content';
import { GradeDetailSkeleton } from '@/components/molecules/grades/grade-detail-skeleton';

export default async function GradeDetailPage({
  params,
}: {
  params: Promise<{ gradeId: string }>;
}) {
  const { gradeId } = await params;
  // Only light work here (e.g. quick auth); heavy fetch is in GradeDetailContent
  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-6 lg:p-8">
      <Suspense fallback={<GradeDetailSkeleton />}>
        <GradeDetailContent gradeId={gradeId} />
      </Suspense>
    </div>
  );
}
```

**Optional pattern (promise + Client Component + `use()`):** The official streaming guide also shows starting a fetch **without** `await` in the Server Component, passing the **promise** into a **Client Component** that calls React’s **`use()`** inside `<Suspense>`. That keeps the fetch concurrent with the rest of the tree. Use this when it fits your component split; async Server Components remain the default baseline.

**When to Use Suspense**:
- When you need different loading states for different sections
- When some content loads faster than others
- When you want to show partial content while other parts load
- When you need the page shell and loading UI to appear quickly without blocking the whole route

### 2.3. loading.tsx vs Suspense Fallback: When to Use Which

**You do not need to use both `loading.tsx` and a Suspense fallback for the same content.** They operate at different levels:

| Mechanism | Scope | Purpose |
|-----------|--------|---------|
| **loading.tsx** | Route-level (entire page) | Shown during navigation while the whole `page.tsx` (and its layout) is loading. Next.js applies it automatically. |
| **Suspense fallback** | Within-page (specific sections) | Shown for individual async components inside a page, so the rest of the page can render while only those parts load. |

**Guidance:**
- **Route-level loading:** Use `loading.tsx` only. No need to wrap the same page content in Suspense with a duplicate full-page fallback—that would be redundant.
- **Granular loading:** Use Suspense boundaries inside `page.tsx` when you want different skeletons per section or partial content (e.g. header visible while a list loads).
- **Both together:** They can coexist when they serve different purposes: `loading.tsx` covers the initial navigation; Suspense inside the page covers specific async sections. Do not use both to show the same loading UI for the same content.

**Priority for fastest navigation:** Use **loading.tsx** for segment-level navigation feedback and Suspense for within-page sections and streaming-aligned progressive rendering.

### 2.4. Recommended Pattern: Fast Page + Suspense per Heavy Block

1. **Keep `page.tsx` (and segment layout) light:** Only `await params`, quick auth if needed, no heavy fetches. This allows the server to send the first chunk quickly.
2. **Move heavy data loading (and, if desired, role checks) into content components** (e.g. `GradeDetailContent`, `GradesListContent`). Each component performs its own async work.
3. **Wrap each such component in `<Suspense fallback={<…Skeleton />}>`** with a dedicated skeleton that matches that block's structure.
4. **Optionally add `loading.tsx`** for the segment so the user sees a route-level skeleton until the first chunk (with the page shell) arrives.

**Minimal structure:**

```typescript
// page.tsx — light: only params and quick auth
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAuth(); // fast check only
  return (
    <div>
      <Suspense fallback={<MainSkeleton />}>
        <MainContent id={id} />
      </Suspense>
      <Suspense fallback={<SidebarSkeleton />}>
        <SidebarContent id={id} />
      </Suspense>
    </div>
  );
}
// MainContent, SidebarContent — each does its own heavy fetch
```

### 2.5. `error.tsx` and segment error boundaries

`<Suspense>` and `loading.tsx` address **loading** (fallbacks while work is in progress). They are **not** a substitute for **error handling**.

- **`error.tsx`** (or `error.js`) is a **special file** that wraps a route segment in a **React Error Boundary**. If a runtime error is thrown in a child of that segment, Next.js shows the error UI instead of crashing the whole tree. See [Error Handling](https://nextjs.org/docs/app/getting-started/error-handling) and [`error.js` convention](https://nextjs.org/docs/app/api-reference/file-conventions/error).
- The error component must be a **Client Component** (`'use client'`). It receives `error` and a **`reset`** function to retry rendering the segment.
- **`global-error.js`** (root `app/global-error.tsx`) catches errors in the root layout; it must include its own `<html>` and `<body>` when used.

**Relationship to Suspense:** Use **Suspense** for slow async work; use **`error.tsx`** for **unexpected failures** in that segment. Pairing them is normal: a failed fetch or render should surface a recovery UI, not a blank screen.

```tsx
'use client'

import { useEffect } from 'react'

export default function SegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong</h2>
      <button type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  )
}
```

---

## 3. Instant Route Transition (Auth/Role in Layout)

**Problem:** If the segment **layout** (or root layout) does a blocking `await` (e.g. role check, heavy session fetch), the server does not send the first chunk until that completes. The user sees no visual change on link click—no new route, no skeleton.

**Solution:**

- **Do not block the first chunk** with heavy auth/role in layout. Keep layout to structure only, or use a very fast, cached check (e.g. cookie/session read without a slow DB call).
- **Move role/permission checks** into a **child component** and wrap it in **Suspense**. That child can call `redirect()` if unauthorized. The page should show shell + fallback quickly; once the check completes, render content or redirect without assuming streamed server chunks.

**Structure:**

```
Layout (no heavy await)
  → Page (light: params, minimal auth)
    → Suspense fallback={<Skeleton />}
      → Child (role check + content, or redirect())
```

Optionally, do a very fast check in layout (e.g. from cache/cookie) and keep the full role/permission check in a Suspense-wrapped child so the first chunk is never delayed.

---

## 4. useTransition for Immediate Click Feedback (Optional)

When using `<Link>`, Next.js uses transitions. On the client, you can use **useTransition** (e.g. in a parent layout or provider) to read `isPending` and show a **global indicator** (progress bar, top-of-page spinner) as soon as the user clicks, before the first server chunk arrives. This improves perceived responsiveness.

- **Note:** useTransition is for UI feedback only. It does not replace the need for a fast first chunk (light layout/page + Suspense). Avoid blocking navigation or mixing it with heavy mutations; prefer server-side rendering, ISR, or client-side refresh for actual content.

---

## 5. Skeleton Component Patterns

### 5.1. Creating Skeleton Components

Skeletons are used both in `loading.tsx` and in Suspense fallbacks; the same structure and accessibility rules apply. Skeleton components should **mirror the exact structure** of the actual content they represent:

```typescript
// components/molecules/grades/grade-list-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

/**
 * Skeleton for grades list
 * Displays 6 skeleton cards in a responsive grid
 * Matches the structure of GradesList component
 */
export const GradeListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 md:gap-6 md:p-6 lg:grid-cols-3 lg:gap-8 lg:p-8">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="flex flex-col h-full">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-6 w-32" /> {/* Title */}
              <Skeleton className="h-5 w-16 rounded-full" /> {/* Badge */}
            </div>
            <Skeleton className="h-4 w-full mt-2" /> {/* Description line 1 */}
            <Skeleton className="h-4 w-3/4 mt-1" /> {/* Description line 2 */}
          </CardHeader>
          <CardContent className="flex-1">
            <Skeleton className="h-4 w-24" /> {/* Age range */}
          </CardContent>
          <CardFooter>
            <Skeleton className="h-11 w-full rounded-md" /> {/* Button */}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
```

### 5.2. Skeleton Component Best Practices

1. **Match Structure**: Skeleton should match the exact structure of actual content
2. **Realistic Dimensions**: Use dimensions that match actual content sizes
3. **Animation**: Use `animate-pulse` class for smooth pulsing animation
4. **Accessibility**: Include `aria-label` for screen readers:
   ```typescript
   <Skeleton 
     className="h-6 w-32" 
     aria-label="Loading grade information"
   />
   ```
5. **Responsive Design**: Ensure skeleton is responsive like actual content
6. **Component Size**: Keep skeleton components under 100 lines (follow component size limit)

### 5.3. Complex Skeleton Example

For complex pages with multiple sections:

```typescript
// components/molecules/grades/grade-detail-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

/**
 * Skeleton for grade detail page
 * Matches the structure of GradeDetailPage component
 */
export const GradeDetailSkeleton = () => {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Grade Header Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <Skeleton className="h-9 w-64 mb-2" /> {/* Title */}
              <Skeleton className="h-5 w-full" /> {/* Description */}
              <Skeleton className="h-4 w-32 mt-2" /> {/* Age range */}
            </div>
            <Skeleton className="h-6 w-20 rounded-full" /> {/* Badge */}
          </div>
        </CardHeader>
      </Card>

      {/* Grade Actions Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" /> {/* Actions title */}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-10 rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      </div>

      {/* Pupils Table Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## 6. Integration with Server Components

### 6.1. Server Components and Loading States

For fast navigation, the Server Component page should return quickly. Heavy data loading (and optional role checks) belong in **child** async components wrapped in Suspense. The page (and layout) should do only light work so the first RSC chunk can be sent immediately.

Server Components work with loading states in two ways:

1. **Route-level:** `loading.tsx` is shown while the segment (layout + page) is loading.
2. **Within-page:** Child async components inside Suspense show their fallback until ready; resolved sections can stream in per boundary.

**Example (fast page + Suspense):**

```typescript
// app/(private)/grades/[gradeId]/page.tsx — light: auth only
export default async function GradeDetailPage({
  params,
}: {
  params: Promise<{ gradeId: string }>;
}) {
  const { gradeId } = await params;
  await requireAuth(); // fast check only
  return (
    <div className="container max-w-5xl p-4 md:p-6 lg:p-8">
      <Suspense fallback={<GradeDetailSkeleton />}>
        <GradeDetailContent gradeId={gradeId} />
      </Suspense>
    </div>
  );
}
// GradeDetailContent (async) does getGradeWithFullDataAction and renders or redirects
```

### 6.2. Combining Server Actions with Loading States

Server Actions can trigger revalidation, which will show loading states:

```typescript
// actions/grades.ts
'use server';

export async function createGradeAction(data: GradeInput) {
  // ... create grade logic
  revalidatePath('/grades'); // Triggers revalidation
  // Next.js will show loading.tsx during revalidation
}
```

---

## 7. Best Practices

### 7.1. Instant Page Rendering

- ✅ **DO**: Keep `page.tsx` (and layout) light; wrap each heavy block in Suspense with its own fallback
- ✅ **DO**: Create `loading.tsx` for every route that loads data (or use Suspense-only for that segment)
- ✅ **DO**: Use skeleton components that match actual content structure
- ✅ **DO**: Ensure skeleton is responsive like actual content
- ✅ **DO**: Use Suspense fallback only for within-page, granular loading (specific sections), not as a duplicate of route-level loading
- ❌ **DON'T**: Show blank pages while loading
- ❌ **DON'T**: Use generic "Loading..." text without skeleton
- ❌ **DON'T**: Use both `loading.tsx` and a Suspense fallback for the same content—pick one per scope (route vs section)

### 7.2. Skeleton Component Design

- ✅ **DO**: Match exact structure of actual content
- ✅ **DO**: Use realistic dimensions
- ✅ **DO**: Include accessibility labels
- ✅ **DO**: Keep components under 100 lines
- ❌ **DON'T**: Use placeholder text in skeletons
- ❌ **DON'T**: Create skeletons that don't match content structure

### 7.3. Performance Considerations

- ✅ **DO**: Use Server Components for data loading
- ✅ **DO**: Minimize client-side JavaScript
- ✅ **DO**: Use ISR for pages that don't need real-time data
- ❌ **DON'T**: Load unnecessary data in loading states
- ❌ **DON'T**: Block navigation with heavy computations

### 7.4. Fast Navigation / Streaming

- ✅ **DO**: One Suspense boundary per logical heavy block (main content, sidebar, etc.)
- ✅ **DO**: Move heavy `await` out of `page.tsx` and layout into child components
- ❌ **DON'T**: Block the first server chunk with heavy work in layout or page (e.g. role check); move checks to Suspense-wrapped children

### 7.5. Common pitfalls (typical mistakes)

1. **Too many Suspense boundaries** — Do not wrap every tiny component. Group by **logical units** that depend on **different data sources** or different latency budgets.
2. **Skeleton worse than content** — If the fallback’s **size and layout** do not match the final UI, you will harm **CLS** (Cumulative Layout Shift) and perceived quality. Match structure and dimensions (see §5).
3. **Streaming where it adds no value** — **Small, fast pages** may not need extra boundaries; avoid over-engineering and duplicated skeleton logic.
4. **Forgetting `error.tsx`** — **Suspense** handles **waiting**; **`error.tsx`** handles **failures**. If async work can throw, the segment should have an error boundary (or a parent that handles recovery) so users see a controlled fallback instead of an unhandled error.

---

## 8. Examples for Grades Pages

### 8.1. Grades List Page

**File Structure**:
```
app/(private)/grades/
├── page.tsx          # Server Component with data loading
├── loading.tsx       # Loading state with GradeListSkeleton
└── components/
    └── molecules/
        └── grades/
            └── grade-list-skeleton.tsx
```

**Implementation**:

```typescript
// app/(private)/grades/loading.tsx
import { GradeListSkeleton } from '@/components/molecules/grades/grade-list-skeleton';

export default function GradesLoading() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-9 w-32 bg-muted animate-pulse rounded-md mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="h-11 w-32 bg-muted animate-pulse rounded-md" />
      </div>
      <GradeListSkeleton />
    </div>
  );
}
```

**Note:** If the list fetch is heavy, consider moving it to a component (e.g. `GradesListContent`) and wrapping it in Suspense with a list skeleton; `loading.tsx` still covers the segment's initial state.

### 8.2. Grade Detail Page

Use the **fast page + Suspense** pattern so the page shell and skeleton appear immediately; content streams when the heavy fetch completes.

**Bad (blocks page opening):**

```typescript
// ❌ BAD: Page won't open until all await operations complete
export default async function GradeDetailPage({
  params,
}: {
  params: Promise<{ gradeId: string }>;
}) {
  const { gradeId } = await params;
  const user = await getAuthenticatedUser();
  const gradeResult = await getGradeWithFullDataAction({ id: gradeId }); // Blocks first chunk
  return <div>...</div>;
}
```

**Good (instant shell + deferred heavy content without streaming assumptions):**

**File structure:**
```
app/(private)/grades/[gradeId]/
├── page.tsx                  # Light: params, auth, Suspense shell
├── grade-detail-content.tsx  # Heavy: getGradeWithFullDataAction, redirect/notFound
├── loading.tsx               # Optional: segment-level skeleton until first chunk
└── components/.../grade-detail-skeleton.tsx
```

**page.tsx:**
```typescript
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth/cognito';
import { RoutePath } from '@/lib/routes/RoutePath';
import { GradeDetailContent } from './grade-detail-content';
import { GradeDetailSkeleton } from '@/components/molecules/grades/grade-detail-skeleton';

export default async function GradeDetailPage({
  params,
}: {
  params: Promise<{ gradeId: string }>;
}) {
  const { gradeId } = await params;
  const user = await getAuthenticatedUser();
  if (!user) redirect(RoutePath.auth);

  return (
    <div className="container max-w-5xl p-4 md:p-6 lg:p-8">
      <Suspense fallback={<GradeDetailSkeleton />}>
        <GradeDetailContent gradeId={gradeId} />
      </Suspense>
    </div>
  );
}
```

**grade-detail-content.tsx:** Async component that calls `getGradeWithFullDataAction`, then renders content or calls `notFound()` / `redirect()`.

Optionally, add `loading.tsx` for this segment; it is shown until the first chunk (page shell) is sent.

---

## 9. Testing Loading States

### 9.1. Manual Testing

1. **Navigation Test**: Click link to page → page should open immediately with skeleton
2. **Content Replacement**: Wait for data → skeleton should smoothly transition to content
3. **Streaming Test**: On a page with heavy blocks, verify that the shell and skeletons appear first, then content replaces fallbacks without a long blank state
4. **Responsive Test**: Test on mobile, tablet, desktop → skeleton should be responsive
5. **Accessibility Test**: Use screen reader → skeleton should have proper labels

### 9.2. Performance Testing

- Measure Time to First Byte (TTFB)
- Measure First Contentful Paint (FCP)
- Verify skeleton appears immediately (< 100ms)
- Verify smooth transition to content

---

## 10. Troubleshooting

### 10.1. Skeleton Not Showing

**Problem**: `loading.tsx` is not being used during navigation.

**Solutions**:
- Ensure `loading.tsx` is in the same directory as `page.tsx`
- Check that `page.tsx` is an async Server Component
- Verify the Next.js version matches the project’s pinned version in `package.json`
- Check browser console for errors

### 10.2. Skeleton Structure Mismatch

**Problem**: Skeleton doesn't match actual content structure.

**Solutions**:
- Review actual component structure
- Update skeleton to match exactly
- Test on different screen sizes
- Verify responsive breakpoints match

### 10.3. Performance Issues

**Problem**: Skeleton causes performance issues.

**Solutions**:
- Reduce number of skeleton items
- Optimize skeleton component rendering
- Use Server Components for data loading
- Consider ISR for static content

### 10.4. No Visual Response on Link Click / Transition Feels Stuck

**Problem**: User clicks a link and sees no new route or skeleton for a long time.

**Cause**: The first server chunk is delayed because a heavy `await` runs in the segment layout or in `page.tsx` (e.g. role check, slow session fetch).

**Solutions**:
- Move heavy work (data fetch, role check) into **child components** and wrap them in **Suspense**
- Keep layout and page light so the server can send the first chunk quickly
- See Section 3 (Instant Route Transition) for moving auth/role checks into a Suspense-wrapped child

---

## 11. Cross-References

- **Suspense for fast navigation**: Content merged into this document (formerly `docs/guidelines/nextjs/ai_suspense_fast_navigation.md`).
- **Next.js**: [Loading UI and Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming) — streaming, `loading.js`, and Suspense (verify against latest docs).
- **Next.js**: [Error Handling](https://nextjs.org/docs/app/getting-started/error-handling) — `error.js` / `error.tsx`, `reset`, and recovery.
- **React Components Guidelines**: `docs/guidelines/react/ai_component_guidelines.md` - Section 10 (Loading States)
- **Server Components**: `docs/components/SERVER_COMPONENTS.md` - Loading states with Server Components
- **ISR Optimization**: `docs/guidelines/nextjs/ai_isr_optimization_guidelines.md` - Combining ISR with loading states
- **Component Library**: `docs/components/COMPONENT_LIBRARY.md` - Skeleton component examples

---

## 12. AI Assistant Instructions

When implementing loading states:

1. **Fast navigation structure:** Keep `page.tsx` (and segment layout) light (params, minimal auth). Move heavy data and role checks into child components; wrap each such block in `<Suspense fallback={…}>`.
2. **Skeletons:** One skeleton per Suspense boundary, matching the content structure.
3. **Identify Loading Needs**: Determine which pages need loading states (route-level vs within-page sections).
4. **Choose the Right Mechanism**: Use `loading.tsx` for route-level loading; use Suspense fallback for granular, within-page loading. Do not use both for the same content.
5. **Add loading.tsx Files**: Create `loading.tsx` for the segment when you want a route-level skeleton until the first chunk arrives.
6. **Errors:** Add `error.tsx` (or rely on a parent segment’s error boundary) for route segments where async work can fail; use `reset` for recovery. Do not confuse Suspense (loading) with Error Boundaries (errors).
7. **Test Navigation**: Verify instant page rendering, correct loading states, and final render in production-like conditions; critical content must not depend on client-only timing quirks.
8. **Ensure Responsiveness**: Make skeleton responsive like actual content.
9. **Add Accessibility**: Include proper ARIA labels for screen readers.
10. **Follow Best Practices**: Match structure, use realistic dimensions, keep under 100 lines; avoid pitfalls in §7.5.

---

**Version:** 2.1  
**Last Updated:** 23 March 2026  
**Author:** AI Documentation Team  
**Next.js Version:** current stable

