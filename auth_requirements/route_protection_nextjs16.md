# Route protection in Next.js 16 (proxy vs layout)

This document describes how to protect routes (e.g. `/admin/*`) in Next.js 16 and how it relates to Auth.js 5. It does not replace [auth_requirements.md](auth_requirements.md); it focuses on the proxy vs layout choice.

**Sources:** [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16) (proxy), [Auth.js v5 – Authenticating server-side](https://authjs.dev/getting-started/migrating-to-v5) (proxy/middleware, Server Components).

---

## 1. Next.js 16: from middleware to proxy

In Next.js 16, request-level logic that previously lived in **`middleware.ts`** is implemented in **`proxy.ts`**:

- **File:** `proxy.ts` at the project root or under `src/` (e.g. `src/proxy.ts`).
- **Export:** A function named **`proxy`** (instead of `middleware`), with signature `proxy(request: NextRequest)` (or equivalent per Next.js 16 docs).
- **API:** The request/response API (`NextRequest`, `NextResponse`, and configuration such as `matcher`) remains the same as for middleware. So any documentation or examples that refer to "middleware" for routing, redirects, or headers apply to the proxy; only the file name and export name change.

The project plan and tasks refer to **proxy.ts** (not `middleware.ts`) wherever route-level protection is discussed.

---

## 2. Two ways to protect /admin

Access to `/admin` (and below) should be restricted to authenticated users. Unauthenticated users must be redirected to the sign-in page. **This project uses JWT sessions** (session in cookie); no database session store is used, which keeps the proxy/layout compatible with Edge when needed. Two approaches are valid:

### 2.1 Option A: proxy.ts

- **How:** In `proxy.ts`, run the Auth.js session check (using the Auth.js v5 `auth` export or a wrapper) for requests that match `/admin` (or `/admin/*`). If there is no session, return a redirect response to the sign-in page.
- **Note (Auth.js v5):** The old `next-auth/middleware` import is replaced. Use the `auth` export from your auth config. If you use a database adapter that is not Edge-compatible, you may need a separate auth config (e.g. `auth.config.ts`) without the adapter for the proxy, and use JWT or a similar strategy there — see [Auth.js v5 Edge compatibility](https://authjs.dev/getting-started/migrating-to-v5) and [Prisma adapter](https://authjs.dev/getting-started/adapters/prisma).
- **Next.js 16:** The file is `proxy.ts` and the exported function is `proxy`, as per the Next.js 16 upgrade guide.

### 2.2 Option B: Layout guard

- **How:** In the layout for `/admin` (e.g. `app/admin/layout.tsx`), call Auth.js **`auth()`** (server-side). If there is no session, redirect to the sign-in page. Otherwise, render children. This keeps auth checks in the Server Component tree (layout) instead of in the proxy.
- **Recommendation:** Next.js 16 and Auth.js documentation recommend moving authentication checks into **Server Layout guards** (layout) where possible, and using the proxy for routing concerns (redirects, headers). Layout-based protection is often simpler and avoids Edge/adapter compatibility issues.

---

## 3. Best practices: “last resort” vs business logic

Auth.js officially supports both proxy and layout for protection. Next.js 16 emphasizes: use **proxy** for “last resort” only (routing, redirects, headers); put **auth and access logic** in **layouts**.

### 3.1 proxy.ts (last resort)

Use proxy only for behavior that **does not depend** on whether the user is authenticated: routing and headers **without** calling `auth()` and without DB access (keeps the proxy light and Edge-compatible):

- **Path-only redirects (no auth):** e.g. “if request is for deprecated `/old-admin` → redirect to `/admin`”, or “`/sign-in` → `/login`”. Do **not** do “all requests to `/admin` → `/sign-in`”: that would redirect **authenticated** users to the sign-in page when they navigate between admin pages.
- **Security headers** for all requests (e.g. `X-Frame-Options`, `X-Content-Type-Options`).
- **Other routing-only rules** (rewrites, path-based A/B, etc.).

In this approach, **do not** implement “unauthenticated user hit `/admin` → redirect to sign-in” in the proxy: that decision requires knowing whether a session exists (i.e. calling auth or reading the session cookie). Put that logic in the layout.

### 3.2 Layout (business logic)

Use the `/admin` layout for auth and access decisions:

- In `app/admin/layout.tsx`, call **`auth()`**: get session and role.
- If there is no session — `redirect('/sign-in')`. Only requests that reach the layout are evaluated; authenticated users navigating between admin pages stay where they are.
- If there is a session but the role is not allowed for this section (e.g. only ADMIN may access `/admin/settings`) — `redirect('/admin')` or return 403.
- If allowed — render `children`. You can pass role-dependent data to child components (e.g. different UI for ADMIN vs EDITOR).

**Summary:** Proxy = “where to send the request” **without** considering auth (path-based redirects, headers). Layout = “is there a session and role, should we allow access?” (auth, redirect to sign-in when no session, role-based content).

See also the mentor-style example (in Russian): [docs/mentor/01_architektura_i_auth.md](../mentor/01_architektura_i_auth.md) (§ Защита /admin, пример разделения).

---

## 4. Choosing and documenting the approach

- **Project plan:** Both options are acceptable. The plan and implementation tasks may refer to "proxy.ts or layout"; the implementer chooses one (or both: e.g. layout for auth, proxy for other redirects).
- **Documentation:** In [architecture.md](../architecture.md) and [auth_requirements.md](auth_requirements.md), both options are mentioned. When implementing, document in code or in docs which approach is used (e.g. "Admin routes protected via `app/admin/layout.tsx`" or "Admin routes protected via `proxy.ts`").

---

## 5. Summary

| Topic              | Detail                                                                 |
|--------------------|-----------------------------------------------------------------------|
| Next.js 16         | Use `proxy.ts` and export `proxy()` instead of `middleware.ts` / `middleware()`. |
| Auth.js v5         | Use `auth` export (or wrapper) for session check; `next-auth/middleware` is replaced. |
| proxy (last resort)| Path-only redirects, security headers; no auth-dependent logic (do not redirect all `/admin` to sign-in without session check). |
| Layout (business) | `auth()` in `/admin` layout; redirect to sign-in when no session; role checks; authenticated users stay in place when navigating admin. |
| Recommendation    | Prefer layout for “who may see /admin”; use proxy for routing and headers only. |

See [auth_requirements.md](auth_requirements.md) for full authentication and route-protection requirements and [architecture.md](../architecture.md) for the overall auth flow.
