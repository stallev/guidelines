# Authentication, authorization, and logout requirements

This document defines requirements for authentication, session management, authorization (roles), logout, route protection, and related security. It is intended for AI agents and implementers. All requirements are tied to authoritative sources; this project uses **Auth.js 5 (beta)**.

**Sources used:** OWASP Authentication Cheat Sheet, OWASP Session Management Cheat Sheet, Auth.js official documentation (authjs.dev), including [Migrating to v5](https://authjs.dev/getting-started/migrating-to-v5). Cookie best practices (httpOnly, Secure, SameSite) align with OWASP Session Management and MDN.

---

## 1. Authentication (identity verification)

**Sources:** [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [Auth.js Credentials provider](https://authjs.dev/getting-started/installation) and v5 configuration.

- **Mechanism:** Verify the user with **Credentials** (email + password). No OAuth/OIDC on the first phase; those may be added later.
- **Server-only validation:** Validate credentials on the server (e.g. Zod for input shape). Never rely on client-side checks alone for security.
- **No secrets on the client:** Passwords and hashes must not be sent to or stored in client code. Only the result of server-side verification (e.g. session) is used on the client.
- **Password hashing:** Store passwords using a strong, adaptive hash (e.g. **bcrypt**). Compare using constant-time, framework-safe functions to avoid timing and type-confusion attacks — *OWASP Authentication Cheat Sheet: "Compare Password Hashes Using Safe Functions"*.
- **Auth.js v5:** Use the Credentials provider in the central config (e.g. `auth.ts`). The config exports `auth`, `handlers`, `signIn`, `signOut`; use `signIn("credentials", { redirect: false })` from a Server Action to perform login and return success/error without automatic redirect.

**Alignment with project:** Login is implemented via a **Server Action** (form submit → Server Action → signIn → return result). See [docs/guidelines/nextjs/ai_nextjs_db_data_handle.md](../guidelines/nextjs/ai_nextjs_db_data_handle.md).

---

## 2. Session management

**Sources:** [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [Auth.js v5](https://authjs.dev/getting-started/migrating-to-v5) (universal `auth()`, session strategies).

- **Where sessions live:** Auth.js supports **JWT** or **database** session strategy. **This project uses the JWT strategy:** the session is stored in an encrypted cookie (not in the database). The Prisma schema has no Session model (removed). When using an adapter (e.g. Prisma) only for User lookup (Credentials), the session strategy is still JWT unless explicitly configured otherwise.
- **Session lifetime and renewal:** Define session duration and, if applicable, sliding/rotation behavior. Use Auth.js configuration; do not expose session IDs in URLs — *OWASP: "Use cookies for session ID exchange"*.
- **Server-only session API:** Use only server-side APIs to read and validate the session. **Auth.js v5:** a single **`auth()`** function replaces `getServerSession`, `getSession`, `withAuth`, `getToken`, and is used in Server Components, Route Handlers, and (via wrapper) in proxy. Do not rely on client-only session reads for access control.
- **Session ID properties (OWASP):** Session identifiers must have sufficient entropy (e.g. ≥64 bits); use CSPRNG; do not put sensitive or PII in the session ID value — meaning is stored server-side. Auth.js satisfies these when used as intended.

---

## 3. Cookies (session ID exchange)

**Sources:** [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) (Cookies section), [Auth.js v5](https://authjs.dev/getting-started/migrating-to-v5) (cookies: `next-auth` prefix renamed to `authjs`).

- **httpOnly:** Session cookie must have the **HttpOnly** attribute so scripts cannot read it (mitigates XSS session theft). *OWASP: "HttpOnly … mandatory to prevent session ID stealing through XSS attacks."*
- **Secure:** Session cookie must have the **Secure** attribute in production so it is sent only over HTTPS. *OWASP: "Secure … mandatory to prevent the disclosure of the session ID through MitM attacks."*
- **SameSite:** Set **SameSite** appropriately (e.g. `Lax` or `Strict`) to reduce CSRF and cross-origin leakage. *OWASP: "SameSite … mitigating … cross-site request forgery attacks."*
- **Domain and path:** Use a restrictive scope; do not set an overly permissive Domain. Auth.js allows configuration of cookie options; ensure production config matches the above.

---

## 4. Authorization (roles)

**Sources:** OWASP Session Management (session binds "access rights"), project plan and [docs/secure_data/user_creds.md](../secure_data/user_creds.md).

- **Roles:** Users have a role (e.g. **ADMIN**, **EDITOR**). Roles are defined in the data model and seed (user_creds); production credentials come from env (e.g. ADMIN_EMAIL, ADMIN_PASSWORD, EDITOR_EMAIL, EDITOR_PASSWORD).
- **Server-side role check:** Before granting access to admin routes or sensitive actions, verify the session and the role **on the server** (e.g. in layout or Route Handler). Do not rely on client-side role checks for security.
- **Auth.js v5:** Include the role in the session (e.g. via callbacks in the Auth.js config). Use `auth()` to read the session and role in Server Components or Route Handlers that protect `/admin` or perform role-gated actions.

---

## 5. Logout

**Sources:** [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) (session invalidation), [Auth.js v5](https://authjs.dev/getting-started/migrating-to-v5) (`signOut` export).

- **Full session termination:** Logout must invalidate the server-side session and clear the client-side session cookie so the session cannot be reused.
- **Auth.js v5:** Use the exported **`signOut`** (from the central auth config). In a **Route Handler** (e.g. `POST /api/auth/logout`): call `signOut`, clear the Auth.js session cookie as per Auth.js docs, then redirect to the sign-in page.
- **Implementation choice:** Logout is implemented as a **Route Handler**, not a Server Action, to perform a single mutation (sign-out + redirect) without triggering a full Server Component re-render — consistent with [docs/guidelines/nextjs/ai_nextjs_db_data_handle.md](../guidelines/nextjs/ai_nextjs_db_data_handle.md).

---

## 6. Route protection (/admin)

**Sources:** [Auth.js v5](https://authjs.dev/getting-started/migrating-to-v5) (authenticating server-side; Next.js 16: proxy.ts), [Next.js 16](https://nextjs.org/docs/app/guides/upgrading/version-16) (proxy vs middleware). See also [docs/mentor/01_architektura_i_auth.md](../mentor/01_architektura_i_auth.md) (example: “last resort” vs business logic).

- **Goal:** Only authenticated users (and optionally only certain roles) may access `/admin/*`. Unauthenticated requests must be redirected to the sign-in page. Authenticated users navigating between admin pages must not be redirected to sign-in.
- **Next.js 16 — “last resort” vs business logic:** Next.js 16 and Auth.js emphasize proxy for **“last resort”** only (routing, redirects, headers that do **not** depend on auth). The “unauthenticated user hit `/admin` → redirect to sign-in” decision **requires** knowing whether a session exists; that is auth/access logic, not path-only routing.
  - **proxy.ts (last resort):** Use `proxy.ts` (root or `src/proxy.ts`), exporting `proxy(request: NextRequest)`, for path-based redirects that do **not** depend on session (e.g. `/old-admin` → `/admin`, or security headers). Do **not** redirect all requests to `/admin` to `/sign-in` in proxy without a session check: that would also redirect authenticated users. If you do protect `/admin` in proxy, you must call auth (or equivalent session check); then proxy is no longer “path-only” and may need edge-compatible config (e.g. JWT, no DB adapter in proxy). Auth.js v5 replaces `next-auth/middleware`; in Next.js 16, `middleware.ts` is renamed to `proxy.ts`.
  - **Layout guard (recommended for /admin protection):** Check the session in the `/admin` layout (e.g. `app/admin/layout.tsx`): call `auth()`, then redirect to sign-in only when there is no session. Role-based access (e.g. only ADMIN for `/admin/settings`) is also handled here. Authenticated users moving between admin pages remain in place. Next.js 16 recommends moving auth and access logic into Server Layout guards; proxy is left for routing and headers only.
- **Consistency:** The project plan and tasks refer to proxy or layout; both can be used. Prefer **layout** for “who may see /admin” (auth, roles); use **proxy** for path-only redirects and headers. Document the chosen approach in [route_protection_nextjs16.md](route_protection_nextjs16.md).

---

## 7. Security (general)

**Sources:** [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [Auth.js v5 environment variables](https://authjs.dev/getting-started/migrating-to-v5).

- **AUTH_SECRET:** Set a strong secret (e.g. `openssl rand -base64 32`). Required for Auth.js; do not commit it. Auth.js v5: prefer `AUTH_` prefix; `AUTH_SECRET` is inferred.
- **HTTPS in production:** Login and all authenticated pages must be served over TLS — *OWASP Authentication: "Transmit Passwords Only Over TLS or Other Strong Transport"*; *OWASP Session Management: "Secure cookie attribute" and "Transport Layer Security".*
- **No password logging:** Never log passwords or password hashes. Use generic error messages for login failures to avoid user enumeration — *OWASP Authentication: "Authentication and Error Messages".*
- **Rate limiting (optional):** Limiting login attempts (e.g. per IP or per account) is recommended to reduce brute-force risk; can be a separate task.

---

## 8. Summary and references

| Area           | Requirement summary                                                                 | Primary source(s)        |
|----------------|--------------------------------------------------------------------------------------|--------------------------|
| Authentication | Credentials (email + password), server validation (Zod), bcrypt, no secrets on client | OWASP Auth, Auth.js v5   |
| Session        | JWT (cookie); use `auth()` only on server; lifetime/renewal configured; no Session model in Prisma | OWASP Session, Auth.js v5|
| Cookies        | httpOnly, Secure (prod), SameSite                                                    | OWASP Session, Auth.js   |
| Authorization  | Role in session; check on server before /admin and actions                           | Project plan, user_creds |
| Logout         | signOut + clear cookie; Route Handler; redirect to sign-in                           | OWASP Session, Auth.js v5|
| Route protection | Layout guard for /admin (auth(), redirect if no session); proxy for “last resort” (path-only, headers) | Auth.js v5, Next.js 16   |
| Security       | AUTH_SECRET, HTTPS in prod, no password logging, generic errors                     | OWASP Auth/Session       |

- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html  
- OWASP Session Management Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html  
- Auth.js: https://authjs.dev — Migrating to v5, Credentials, session strategies, cookies, environment variables.
