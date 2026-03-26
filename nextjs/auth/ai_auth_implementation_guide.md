# Authentication Implementation Guide for AI Agent

**Target stack:** Next.js 16.2.x (App Router) | Auth.js v5 (next-auth 5.x beta) | Prisma ORM v7 | Neon PostgreSQL | Vercel hosting

**Purpose:** Implementation guideline for authentication that is explicitly aligned with canonical project PRD documents. This guide is normative only where it does not contradict canonical sources listed in Section 0.

**Sources:** Project PRD documents (canonical first), Auth.js v5 docs, Next.js 16 docs, Prisma v7 docs, OWASP Authentication & Session Management Cheat Sheets, NIST SP 800-63B.

---

## Table of Contents

0. [Document Scope and Canonical References](#0-document-scope-and-canonical-references)
1. [Architecture Overview](#1-architecture-overview)
2. [Runtime Constraints](#2-runtime-constraints)
3. [Dependencies](#3-dependencies)
4. [Environment Variables](#4-environment-variables)
5. [Prisma v7 Schema and Config](#5-prisma-v7-schema-and-config)
6. [Prisma Client Singleton](#6-prisma-client-singleton)
7. [Auth.js v5 Configuration (Split Config Pattern)](#7-authjs-v5-configuration-split-config-pattern)
8. [Proxy Interception](#8-proxy-interception)
9. [Route Protection — Defense-in-Depth Model](#9-route-protection--defense-in-depth-model)
10. [Auth API Route](#10-auth-api-route)
11. [Login Flow (Credentials — Phase 2, Server Action)](#11-login-flow-credentials--phase-2-server-action)
12. [OAuth Login Flow (Google — MVP Baseline)](#12-oauth-login-flow-google--mvp-baseline)
13. [Registration Flow (Email/Password — Phase 2)](#13-registration-flow-emailpassword--phase-2)
14. [Logout](#14-logout)
15. [Password Recovery (Forgot Password)](#15-password-recovery-forgot-password)
16. [Change Password (Authenticated)](#16-change-password-authenticated)
17. [Validation Schemas](#17-validation-schemas)
18. [Security Checklist](#18-security-checklist)
19. [File Structure](#19-file-structure)
20. [Seed Script](#20-seed-script)
21. [Verification Steps](#21-verification-steps)

---

## 0. Document Scope and Canonical References

If this guide conflicts with another document, apply this priority order:

1. [`docs/prds/03_data_model/database_schema_v3.md`](../../prds/03_data_model/database_schema_v3.md)
2. [`docs/prds/01_product_scope/app_functionality_in_brief.md`](../../prds/01_product_scope/app_functionality_in_brief.md)
3. [`docs/prds/auth_requirements.md`](../../prds/auth_requirements.md)
4. [`docs/prds/04_authorization_privacy/authorization_matrix.md`](../../prds/04_authorization_privacy/authorization_matrix.md)
5. [`docs/prds/04_authorization_privacy/security_requirements.md`](../../prds/04_authorization_privacy/security_requirements.md)
6. [`docs/prds/05_runtime/api_contracts/transport_and_versioning.md`](../../prds/05_runtime/api_contracts/transport_and_versioning.md)
7. [`docs/prds/05_runtime/api_contracts/error_model.md`](../../prds/05_runtime/api_contracts/error_model.md)
8. [`docs/prds/05_runtime/backend_stack_decision.md`](../../prds/05_runtime/backend_stack_decision.md)
9. [`docs/prds/06_operations/migration_rollout_plan.md`](../../prds/06_operations/migration_rollout_plan.md)

Implementation phases in this guide:

- **Baseline (MVP):** Google OAuth sign-in, JWT cookie session, role/scope checks from canonical DB model.
- **Phase 2:** Credentials login/registration/password recovery/change-password.

Non-canonical examples from older drafts (for example, `User.role`, `User.passwordHash`, or `VerificationToken`) are replaced in this version with v3-compatible patterns.

---

## 1. Architecture Overview

```
┌──────────────┐     ┌──────────────────────────────────────────────────────┐
│   Browser    │     │  Next.js 16.2.x (Vercel hosting)                     │
│              │     │                                                      │
│ Sign-in form │────>│ proxy.ts (Layer 1 — JWT auth gate, every req)       │
│ OAuth button │     │   └─> auth.config.ts (edge-safe, no DB adapter)     │
│              │     │                                                      │
│              │     │ app/admin/layout.tsx (Layer 2 — UX redirect only)   │
│              │     │   └─> auth.ts (full config with PrismaAdapter)      │
│              │     │                                                      │
│              │     │ Route Handlers / Server Actions (Layer 3 — mandatory│
│              │     │   auth() + role check in every handler/action)      │
│              │     │                                                      │
│              │     │ /packages/policy (Layer 4 — object-level authz)     │
│              │     │                                                      │
│              │     │ src/actions/auth.ts (Server Actions: login, register)│
│              │     │ app/api/auth/[...nextauth]/route.ts (Auth.js API)   │
│              │     │ app/api/auth/logout/route.ts (logout handler)       │
│              │     │                                                      │
│              │     │ Prisma v7 + @prisma/adapter-neon ──> Neon PostgreSQL │
└──────────────┘     └──────────────────────────────────────────────────────┘
```

**Key decisions:**
- **JWT session strategy** — session lives in an encrypted cookie; no Session table in DB.
- **Split Auth.js config** — `auth.config.ts` (edge-compatible, no adapter) for middleware; `auth.ts` (with PrismaAdapter) for server-side `auth()` calls.
- **Interception convention** — follow ADR-022 target policy for request interception and keep implementation consistent across auth guards.
- **Defense-in-depth protection model** — middleware is the primary authentication gate (JWT check on every matched request); layout guard is a secondary UX-level check; Route Handlers and Server Actions each enforce their own `auth()` call; `/packages/policy` enforces object-level authorization. No single layer is trusted as sole protection. See Section 9 for the full layered model.
- **Canonical identity model** — use `app_user`, `auth_account`, `user_role_assignment` from schema v3; do not store role/password hash directly in `app_user`.
- **Auth phases** — MVP flow is OAuth Google; credentials/password-reset are Phase 2 extensions.

---

## 2. Runtime Constraints

Runtime baseline for this repository is defined by:
- `docs/prds/07_governance/adr_022_next16_vercel_runtime_policy.md`
- `docs/guidelines/nextjs/README.md`

Auth implementation must follow these rules:
- server-side authorization checks remain mandatory for protected reads/writes;
- mutable flows use explicit cache invalidation semantics;
- background/post-response jobs stay in the jobs pipeline.

---

## 3. Dependencies

```json
{
  "dependencies": {
    "next": "^16.2.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next-auth": "5.0.0-beta.30",
    "@auth/prisma-adapter": "^2.11.0",
    "@prisma/client": "^7.4.0",
    "@prisma/adapter-neon": "^7.4.0",
    "@neondatabase/serverless": "^1.0.0",
    "bcrypt": "^6.0.0",
    "zod": "^3.23.0",
    "react-hook-form": "^7.50.0",
    "@hookform/resolvers": "^5.0.0"
  },
  "devDependencies": {
    "prisma": "^7.4.0",
    "@types/bcrypt": "^6.0.0",
    "tsx": "^4.0.0",
    "dotenv": "^17.0.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0"
  }
}
```

Install:
```bash
npm install next@latest react react-dom next-auth@5.0.0-beta.30 @auth/prisma-adapter @prisma/client @prisma/adapter-neon @neondatabase/serverless bcrypt zod react-hook-form @hookform/resolvers
npm install -D prisma @types/bcrypt tsx dotenv typescript @types/node @types/react
```

---

## 4. Environment Variables

### .env.local.example

```bash
# Database (Neon PostgreSQL)
# Pooled connection — used by the application at runtime (lib/db/prisma.ts)
DATABASE_URL=

# Direct connection — used by Prisma CLI for migrations (prisma.config.ts)
DIRECT_URL=

# Authentication (Auth.js v5) — generate with: openssl rand -base64 32
AUTH_SECRET=

# Public site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# OAuth: Google
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Seed users (optional; never commit real passwords)
SUPERADMIN_EMAIL=
SUPERADMIN_PASSWORD=
ADMIN_EMAIL=
ADMIN_PASSWORD=
EDITOR_EMAIL=
EDITOR_PASSWORD=

# Phase 2 only: email service for password recovery
# SMTP_HOST=
# SMTP_PORT=
# SMTP_USER=
# SMTP_PASSWORD=
# EMAIL_FROM=
```

**Rules:**
- `AUTH_SECRET` is mandatory. Generate with `openssl rand -base64 32`. Never commit.
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — obtain from Google Cloud Console (OAuth 2.0 Client).
- `NEXTAUTH_URL` — required for Auth.js v5 in non-Vercel environments.
- In Vercel, set all variables in Project Settings -> Environment Variables.

### How to Obtain Environment Variables

| Variable | Purpose | Where to Get | Notes |
|----------|---------|--------------|-------|
| `DATABASE_URL` | Pooled connection for runtime app access | Neon Console → Connection → Pooled connection | **Must include `-pooler` in hostname**; used by Prisma Client at runtime in `lib/db/prisma.ts` |
| `DIRECT_URL` | Direct connection for Prisma migrations | Neon Console → Connection → Direct connection | **Must NOT have `-pooler` suffix**; required for `prisma migrate dev/deploy` commands |
| `AUTH_SECRET` | Session encryption key (mandatory) | Generate locally: `openssl rand -base64 32` | Never commit to version control; different value for each environment (local/qa/prod) |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 Client IDs | Copy the "Client ID" value from your OAuth 2.0 Client |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 Client IDs | Copy the "Client Secret" value; never expose in logs or public repositories |
| `NEXT_PUBLIC_SITE_URL` | Site URL for canonical links, OG tags | Manual entry | Use `http://localhost:3000` for local dev; set to your Vercel domain for production |

**Template reference:** See [`apps/web/.env.local.example`](../../../apps/web/.env.local.example) for a complete example file structure.

---

## 5. Prisma v7 Schema and Config

### prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

enum UserRole {
  STUDENT
  LEADER
  EDITOR
  ADMIN
  SUPERADMIN
  @@map("user_role")
}

model AppUser {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email           String   @unique @db.Citext
  fullName        String?  @map("full_name")
  status          String
  uiLocale        String   @default("ru") @map("ui_locale")
  profileRegionId String?  @db.Uuid @map("profile_region_id")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  accounts        AuthAccount[]
  roleAssignment  UserRoleAssignment?

  @@map("app_user")
}

model AuthAccount {
  userId            String  @db.Uuid @map("user_id")
  provider          String
  providerAccountId String  @map("provider_account_id")
  hashedPassword    String? @map("hashed_password")
  accessToken       String? @map("access_token")
  refreshToken      String? @map("refresh_token")
  expiresAt         BigInt? @map("expires_at")
  idToken           String? @map("id_token")
  user              AppUser @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([provider, providerAccountId])
  @@index([userId], map: "idx_auth_account_user_id")
  @@map("auth_account")
}

model UserRoleAssignment {
  userId    String   @id @db.Uuid @map("user_id")
  role      UserRole
  regionId  String?  @db.Uuid @map("region_id")
  createdBy String?  @db.Uuid @map("created_by")
  createdAt DateTime @default(now()) @map("created_at")
  user      AppUser  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([role], map: "idx_role_assignment_role")
  @@index([regionId], map: "idx_role_assignment_region")
  @@map("user_role_assignment")
}
```

**Schema notes:**
- Canonical identity tables are defined in [`database_schema_v3.md`](../../prds/03_data_model/database_schema_v3.md).
- User role is stored in `user_role_assignment`, not directly in `app_user`.
- Credentials password hash lives in `auth_account.hashed_password` for `provider = "credentials"`.
- Canonical roles: `STUDENT`, `LEADER`, `EDITOR`, `ADMIN`, `SUPERADMIN`.
- `ASSISTANT` is not a system role; it is a separate group-scoped permission.
- No `Session` model — JWT strategy stores session in cookie.
- `VerificationToken` is not part of v3 baseline schema. For reset tokens, use either:
  - dedicated token store (recommended), or
  - explicit schema extension approved via migration/ADR.

### prisma.config.ts (project root)

```ts
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
```

**Migration commands:**
```bash
npx prisma migrate dev --name wave1_auth_identity_alignment
npx prisma generate
npx prisma db seed
```

For production:
```bash
npx prisma migrate deploy
```

Migration rollout policy must follow [`migration_rollout_plan.md`](../../prds/06_operations/migration_rollout_plan.md) (wave-based, no unsynchronized "init everything" migrations in shared environments).

---

## 6. Prisma Client Singleton

### src/lib/db/prisma.ts

```ts
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

if (!globalForPrisma.prisma) {
  const adapter = new PrismaNeon({ connectionString });
  globalForPrisma.prisma = new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma;
```

**Why singleton:** In development, Next.js hot-reloads modules. Without the singleton pattern, each reload creates a new PrismaClient, exhausting database connections.

---

## 7. Auth.js v5 Configuration (Split Config Pattern)

Auth.js v5 requires a split configuration when using request interception with a database adapter that is not Edge-compatible (Prisma with Neon). The split ensures the interception layer can run without importing the full Prisma stack.

### 7.1 src/auth.config.ts (Edge-Compatible — NO adapter)

This file contains providers, pages, and callbacks. It is imported by both `auth.ts` and `proxy.ts`.

```ts
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";
import { getUserAccessContext } from "@/lib/auth/access-context";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: UserRole;
      regionId?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    role?: UserRole;
    regionId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    regionId?: string | null;
  }
}

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // Baseline (MVP): OAuth Google login.
      // Canonical role assignment is resolved from DB in jwt/session callbacks.
      profile(profile: { sub: string; name?: string; email?: string; picture?: string }) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async () => {
        // Credentials authorize logic lives in auth.ts (server-only)
        // where Prisma and bcrypt are available.
        // This placeholder returns null — the real authorize in auth.ts overrides it.
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      // Resolve canonical access context from app_user + user_role_assignment.
      // Implement getUserAccessContext in server-safe module.
      if (token.sub) {
        const access = await getUserAccessContext(token.sub);
        token.role = access?.role;
        token.regionId = access?.regionId ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.regionId = token.regionId;
        session.user.id = token.sub;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");

      if (isOnAdmin) {
        if (isLoggedIn) return true;
        return false; // redirect to signIn page
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
```

**Key points:**
- `authorized` callback is used by the middleware wrapper (`auth`) to decide redirects.
- Credentials `authorize` here is a stub; the real implementation with Prisma + bcrypt lives in `auth.ts`.
- Google `profile` callback does not hardcode a role; role is loaded from canonical DB tables.
- TypeScript module augmentation declares `role` and `regionId` on Session, User, and JWT.

### 7.2 src/auth.ts (Full Server Config — WITH adapter)

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import { signInCredentialsSchema } from "@/lib/validation/credentials";
import bcrypt from "bcrypt";
import authConfig from "./auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 60 * 60 }, // 1 hour — role/status staleness window; see Section 9 guardrail
  ...authConfig,
  providers: [
    ...authConfig.providers.filter((p) => (p as { id?: string }).id !== "credentials"),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const parsed = signInCredentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.appUser.findUnique({
          where: { email },
          include: {
            roleAssignment: true,
            accounts: {
              where: { provider: "credentials" },
              take: 1,
            },
          },
        });

        const account = user?.accounts[0];
        if (!account?.hashedPassword) return null;

        const match = await bcrypt.compare(password, account.hashedPassword);
        if (!match) return null;

        return {
          id: user.id,
          name: user.fullName ?? null,
          email: user.email ?? null,
          role: user.roleAssignment?.role,
          regionId: user.roleAssignment?.regionId ?? null,
        };
      },
    }),
  ],
});
```

**Key points:**
- `PrismaAdapter(prisma)` enables Auth.js to auto-manage Account and User records for OAuth.
- `session: { strategy: "jwt" }` — required when using an adapter but wanting JWT sessions (not DB sessions).
- The Credentials provider is overridden here with the real `authorize` function that calls Prisma and bcrypt.
- Other providers (Google) are inherited from `authConfig.providers` and passed through.
- Exports: `auth` (session reader), `handlers` (GET/POST for `/api/auth`), `signIn`, `signOut`.

> Important: if your adapter schema diverges from canonical v3 tables, implement a custom adapter/repository layer and keep DB writes aligned with `app_user`, `auth_account`, and `user_role_assignment`.

### 7.3 Why split?

```
proxy.ts  ──imports──>  auth.config.ts  (no Prisma, no bcrypt, edge-safe)
                                │
auth.ts  ──imports──>  auth.config.ts  + PrismaAdapter + bcrypt (server-only)
                                │
Server Components, Server Actions, Route Handlers  ──import──>  auth.ts
```

- Interception layer runs on every matched request; keep it minimal and avoid heavy imports.
- **auth.ts** is used in Server Components, Server Actions, and Route Handlers where full Node.js APIs and Prisma are available.

---

## 8. Proxy Interception

### src/proxy.ts

Proxy interception is the **primary authentication gate**. It runs on every request matching `config.matcher` and performs a fast JWT-only check (no DB, no Prisma). This is not a "last resort" — it is the first and mandatory line of defense.

```ts
import NextAuth from "next-auth";
import authConfig from "./auth.config";

// Lightweight NextAuth instance — uses only edge-compatible auth.config.ts.
// No PrismaAdapter, no bcrypt, no DB calls. JWT decode only (~1ms).
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Narrow matcher: only protected routes.
  // Do NOT use '/(.*)'  — that triggers Lambda on every request including static assets.
  // Do NOT use '/api/:path*' — too broad; each Route Handler protects itself.
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/api/admin/:path*",
  ],
};
```

**What proxy interception guarantees on every matched request:**
- JWT signature is valid (HMAC verify — pure crypto, no network call).
- Token has not expired (`exp` claim).
- Unauthenticated requests are redirected to `/sign-in`.

**What proxy interception does NOT guarantee:**
- Role is current (role is embedded in JWT at login time; changes take effect only after token expiry or re-login).
- User account has not been suspended since token was issued.

These gaps are covered by the 1-hour `maxAge` (Section 7.2) and object-level policy checks in Route Handlers/Server Actions (Section 9).

**Runtime specifics:**
- Keep interception config aligned with ADR-022 and current framework conventions.
- Keep JWT-only checks in interception, while role/object checks stay in handlers/actions/policy.

---

## 9. Route Protection — Defense-in-Depth Model

**Principle: every layer protects itself.** No layer trusts that an outer layer has already done the job.

```
Proxy layer         → authentication (JWT valid + not expired) — every matched request
Layout              → UX redirect (session + role check for rendering) — not a security boundary
Route Handler       → auth() + role check — mandatory, every handler
Server Action       → auth() + role check — mandatory, every action
/packages/policy    → object-level authorization — mandatory for resource operations
```

Canonical policy reference: [`authorization_matrix.md`](../../prds/04_authorization_privacy/authorization_matrix.md).

### Why layout is NOT a security boundary

`app/admin/layout.tsx` does not execute for:
- Direct API requests to Route Handlers (`curl /api/admin/users` — layout never runs).
- Server Actions invoked directly.
- Certain Parallel Routes / Intercepting Routes patterns in App Router.

Layout guards are **UX conveniences** — they prevent a logged-in user with wrong role from seeing a flash of content. They are not authorization enforcement.

### 9.1 Proxy Layer (Layer 1 — Authentication Gate)

See [Section 8](#8-proxy-interception). Redirects unauthenticated users to `/sign-in` on every matched request.

### 9.2 Layout Guard (Layer 2 — UX Redirect Only)

```tsx
// app/admin/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  // Secondary check — proxy layer already blocked unauthenticated requests.
  // This catches role mismatches and provides correct UX redirects.
  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div>
      <header>{/* Navigation, user info, sign-out button */}</header>
      <main>{children}</main>
    </div>
  );
};

export default AdminLayout;
```

**For role-restricted sub-routes** (`ADMIN` / `SUPERADMIN` only):

```tsx
// app/admin/settings/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const AdminSettingsLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (!session?.user) redirect("/sign-in");

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPERADMIN") {
    redirect("/admin");
  }

  return <>{children}</>;
};

export default AdminSettingsLayout;
```

### 9.3 Route Handler Protection (Layer 3 — Mandatory)

Every Route Handler must call `auth()` independently. Do not rely on proxy interception or layout having already checked.

```ts
// app/api/admin/groups/route.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ... handler logic
}
```

### 9.4 Server Action Protection (Layer 3 — Mandatory)

Every Server Action must call `auth()` independently.

```ts
"use server";

import { auth } from "@/auth";

export async function deleteGroup(groupId: string) {
  const session = await auth();

  if (!session?.user) throw new Error("Unauthorized");

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPERADMIN") throw new Error("Forbidden");

  // ... action logic — then call /packages/policy for object-level check
}
```

### 9.5 Object-Level Authorization (Layer 4 — /packages/policy)

Role check alone is insufficient for resource operations. Always call policy checks from `/packages/policy/server` in Route Handlers and Server Actions.

```ts
// /packages/policy is imported in Route Handlers and Server Actions ONLY.
// NEVER import /packages/policy/server in proxy.ts.
import { canEditGroup } from "@packages/policy/server";

const allowed = await canEditGroup({ userId: session.user.id, groupId });
if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
```

### Layer Summary

| Layer | Protects | Auth check | DB call | Notes |
|-------|----------|------------|---------|-------|
| `proxy.ts` | All matched routes | JWT decode | ❌ Never | Fast, ~1ms |
| `layout.tsx` | Page rendering UX | `auth()` | ❌ JWT only | Not a security boundary |
| Route Handler | API endpoints | `auth()` + role | ✅ Via policy | Mandatory |
| Server Action | Mutations | `auth()` + role | ✅ Via policy | Mandatory |
| `/packages/policy` | Resource operations | Object-level | ✅ Always | Final authority |



---

## 10. Auth API Route

### app/api/auth/[...nextauth]/route.ts

```ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

This mounts Auth.js at `/api/auth/*`, handling:
- `GET /api/auth/signin` — sign-in page redirect.
- `POST /api/auth/callback/credentials` — credentials login callback.
- `GET /api/auth/callback/google` — Google OAuth callback.
- `GET /api/auth/session` — session endpoint.
- `POST /api/auth/signout` — sign-out.

API envelope and error semantics for custom auth endpoints must follow:
- [`transport_and_versioning.md`](../../prds/05_runtime/api_contracts/transport_and_versioning.md)
- [`error_model.md`](../../prds/05_runtime/api_contracts/error_model.md)

---

## 11. Login Flow (Credentials — Phase 2, Server Action)

### 11.1 Server Action: src/actions/auth.ts

```ts
"use server";

import { signIn } from "@/auth";
import { signInCredentialsSchema } from "@/lib/validation/credentials";
import { AuthError } from "next-auth";

export interface SignInResult {
  ok: boolean;
  data?: { redirectTo: string };
  error?: { code: string; message: string };
}

export const signInWithCredentials = async (
  formData: { email: string; password: string }
): Promise<SignInResult> => {
  const parsed = signInCredentialsSchema.safeParse(formData);
  if (!parsed.success) {
    return { ok: false, error: { code: "AUTH_INVALID_CREDENTIALS", message: "Invalid email or password." } };
  }

  try {
    await signIn("credentials", {
      redirect: false,
      email: parsed.data.email,
      password: parsed.data.password,
    });

    return { ok: true, data: { redirectTo: "/admin/dashboard" } };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { ok: false, error: { code: "AUTH_INVALID_CREDENTIALS", message: "Invalid email or password." } };
        default:
          return { ok: false, error: { code: "AUTH_SIGNIN_FAILED", message: "An error occurred during sign in." } };
      }
    }

    throw error;
  }
};
```

**Per requirements:**
- Server-only validation with Zod.
- Generic error message ("Invalid email or password.") — no user enumeration.
- `redirect: false` — returns result to client instead of auto-redirect.
- No passwords logged or sent to client.
- Response envelope: `ok/data` or `ok/error` per [`transport_and_versioning.md`](../../prds/05_runtime/api_contracts/transport_and_versioning.md).

### 11.2 Sign-In Page: app/(auth)/sign-in/page.tsx

```tsx
import { SignInForm } from "./sign-in-form";

const SignInPage = () => {
  return (
    <div>
      <h1>Sign In</h1>
      <SignInForm />
    </div>
  );
};

export default SignInPage;
```

### 11.3 Client Form: app/(auth)/sign-in/sign-in-form.tsx

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInWithCredentials } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const formSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export const SignInForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: FormValues) => {
    setError(null);
    startTransition(async () => {
      const result = await signInWithCredentials(values);
      if (result.ok) {
        router.push(result.data?.redirectTo ?? "/admin/dashboard");
        router.refresh();
      } else {
        setError(result.error?.message ?? "Sign in failed.");
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p>{form.formState.errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p>{form.formState.errors.password.message}</p>
        )}
      </div>

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign In"}
      </button>

      {/* OAuth sign-in button — see Section 12 */}
      <GoogleSignInButton />
    </form>
  );
};

import { signInWithGoogle } from "@/actions/auth";

const GoogleSignInButton = () => {
  return (
    <form action={signInWithGoogle}>
      <button type="submit">Sign in with Google</button>
    </form>
  );
};
```

---

## 12. OAuth Login Flow (Google — MVP Baseline)

### 12.1 Server Action for OAuth

```ts
// Add to src/actions/auth.ts

export const signInWithGoogle = async () => {
  await signIn("google", { redirectTo: "/admin/dashboard" });
};
```

### 12.2 OAuth Button (Server Action approach)

```tsx
"use client";

import { signInWithGoogle } from "@/actions/auth";

export const GoogleSignInButton = () => {
  return (
    <form action={signInWithGoogle}>
      <button type="submit">Sign in with Google</button>
    </form>
  );
};
```

### 12.3 OAuth Flow

1. User clicks "Sign in with Google".
2. Server Action calls `signIn("google")` which redirects to Google consent screen.
3. After consent, Google redirects back to `/api/auth/callback/google`.
4. Auth.js verifies the token, looks up or creates records in canonical identity tables.
5. JWT is issued with role/scope resolved from `user_role_assignment`.
6. User is redirected to `/admin/dashboard`.

### 12.4 Account Linking

When a user signs in with Google and an account with the same email already exists:
- **Default Auth.js behavior**: creates a new Account record linked to the existing User (if `allowDangerousEmailAccountLinking` is enabled in the provider config).
- **To enable linking**, add to the Google provider config in `auth.config.ts`:

```ts
Google({
  clientId: process.env.AUTH_GOOGLE_ID,
  clientSecret: process.env.AUTH_GOOGLE_SECRET,
  allowDangerousEmailAccountLinking: true,
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
    };
  },
}),
```

**Security note:** `allowDangerousEmailAccountLinking` trusts that the OAuth provider has verified the email. Google verifies emails, so this is acceptable for Google only.

**Canonical references for this section:**
- [`app_functionality_in_brief.md`](../../prds/01_product_scope/app_functionality_in_brief.md) (MVP auth scope)
- [`database_schema_v3.md`](../../prds/03_data_model/database_schema_v3.md) (identity tables)
- [`authorization_matrix.md`](../../prds/04_authorization_privacy/authorization_matrix.md) (role constraints)

---

## 13. Registration Flow (Email/Password — Phase 2)

### 13.1 Validation Schema: src/lib/validation/registration.ts

Use the existing Zod schema, but keep phase-gating explicit:

- This flow is **Phase 2** (not MVP baseline).
- Password policy must follow [`security_requirements.md`](../../prds/04_authorization_privacy/security_requirements.md).

### 13.2 Server Action: src/actions/register.ts

```ts
"use server";

import { prisma } from "@/lib/db/prisma";
import { registrationSchema } from "@/lib/validation/registration";
import bcrypt from "bcrypt";

type RegisterResult =
  | { ok: true; data: { status: "PENDING_APPROVAL" } }
  | { ok: false; error: { code: string; message: string } };

export const registerUser = async (
  formData: { name: string; email: string; password: string; confirmPassword: string }
): Promise<RegisterResult> => {
  const parsed = registrationSchema.safeParse(formData);
  if (!parsed.success) {
    return { ok: false, error: { code: "AUTH_INVALID_INPUT", message: "Invalid input." } };
  }

  const { name, email, password } = parsed.data;

  try {
    const existingUser = await prisma.appUser.findUnique({ where: { email } });
    if (existingUser) {
      return { ok: false, error: { code: "AUTH_REGISTER_FAILED", message: "Unable to create account. Please try again." } };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
      const user = await tx.appUser.create({
        data: {
          email,
          fullName: name,
          status: "PENDING",
        },
      });

      await tx.authAccount.create({
        data: {
          userId: user.id,
          provider: "credentials",
          providerAccountId: email.toLowerCase(),
          hashedPassword,
        },
      });
    });

    return { ok: true, data: { status: "PENDING_APPROVAL" } };
  } catch {
    return { ok: false, error: { code: "AUTH_REGISTER_FAILED", message: "An error occurred. Please try again." } };
  }
};
```

**Per requirements:**
- Server-side validation with Zod.
- Password hash is stored in `auth_account.hashed_password` for `provider = "credentials"`.
- New users start in `app_user.status = PENDING`; role assignment is managed by admin workflows.
- Response envelope uses canonical `ok/data` or `ok/error` contract.

### 13.3 Registration Page

Create `app/(auth)/register/page.tsx` with a form similar to sign-in, calling `registerUser`. On success, redirect to `/sign-in` with "Account created, pending approval" message.

---

## 14. Logout

### app/api/auth/logout/route.ts

```ts
import { signOut } from "@/auth";
import { NextResponse } from "next/server";

export async function POST() {
  await signOut({ redirect: false });
  return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_SITE_URL));
}
```

**Per requirements:**
- Logout is implemented as a Route Handler (not Server Action) — single mutation + redirect without triggering full Server Component re-render.
- `signOut` clears the Auth.js session cookie.
- Redirects to `/sign-in`.

### Logout Button (Client Component)

```tsx
"use client";

export const LogoutButton = () => {
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/sign-in";
  };

  return (
    <button onClick={handleLogout}>
      Sign Out
    </button>
  );
};
```

---

## 15. Password Recovery (Forgot Password)

### 15.1 Overview

1. User submits email on `/forgot-password`.
2. Server generates a cryptographically secure token and stores only its hash in a dedicated reset-token store.
3. Email with reset link is sent (e.g., `https://site.com/reset-password?token=...&email=...`).
4. User clicks link, lands on `/reset-password` with token and email in URL.
5. User enters new password; server validates token, hashes new password, updates credentials account password.
6. Token is invalidated (deleted).
7. User redirected to `/sign-in`.

### 15.2 Token Generation: src/lib/auth/tokens.ts

```ts
import { randomBytes, createHash } from "crypto";
import { tokenStore } from "@/lib/auth/token-store";

const TOKEN_EXPIRY_HOURS = 1;

export const generatePasswordResetToken = async (email: string) => {
  const token = randomBytes(32).toString("hex");
  const hashedToken = createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await tokenStore.deleteByEmail(email);
  await tokenStore.create({ email, hashedToken, expires });

  return token; // return unhashed token for the email link
};

export const validatePasswordResetToken = async (email: string, token: string) => {
  const hashedToken = createHash("sha256").update(token).digest("hex");
  return tokenStore.findValid(email, hashedToken, new Date());
};

export const deletePasswordResetToken = async (email: string, token: string) => {
  const hashedToken = createHash("sha256").update(token).digest("hex");
  await tokenStore.delete(email, hashedToken);
};
```

`tokenStore` can be Redis/KV table or another approved secure store. This avoids introducing non-canonical tables into v3 without ADR/migration approval.

### 15.3 Server Action: src/actions/forgot-password.ts

```ts
"use server";

import { prisma } from "@/lib/db/prisma";
import { generatePasswordResetToken } from "@/lib/auth/tokens";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email(),
});

export const requestPasswordReset = async (formData: { email: string }) => {
  const parsed = emailSchema.safeParse(formData);
  if (!parsed.success) {
    // Always return same message (OWASP: no enumeration)
    return {
      ok: true,
      data: { message: "If an account exists with this email, you will receive a reset link." },
    };
  }

  const user = await prisma.appUser.findUnique({
    where: { email: parsed.data.email },
  });

  if (user) {
    const token = await generatePasswordResetToken(parsed.data.email);
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}&email=${encodeURIComponent(parsed.data.email)}`;
    // TODO: Send email with resetUrl using your email service
    // await sendEmail({ to: parsed.data.email, subject: "Password Reset", body: `Reset: ${resetUrl}` });
    console.log("Password reset URL (remove in production):", resetUrl);
  }

  // Same response whether user exists or not (OWASP)
  return {
    ok: true,
    data: { message: "If an account exists with this email, you will receive a reset link." },
  };
};
```

### 15.4 Server Action: src/actions/reset-password.ts

```ts
"use server";

import { prisma } from "@/lib/db/prisma";
import { validatePasswordResetToken, deletePasswordResetToken } from "@/lib/auth/tokens";
import bcrypt from "bcrypt";
import { z } from "zod";

const resetSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const resetPassword = async (formData: {
  email: string;
  token: string;
  password: string;
  confirmPassword: string;
}) => {
  const parsed = resetSchema.safeParse(formData);
  if (!parsed.success) {
    return { ok: false, error: { code: "AUTH_INVALID_INPUT", message: "Invalid input." } };
  }

  const { email, token, password } = parsed.data;

  const validToken = await validatePasswordResetToken(email, token);
  if (!validToken) {
    return { ok: false, error: { code: "AUTH_RESET_TOKEN_INVALID", message: "Invalid or expired reset link." } };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.authAccount.update({
    where: {
      provider_providerAccountId: {
        provider: "credentials",
        providerAccountId: email.toLowerCase(),
      },
    },
    data: { hashedPassword },
  });

  await deletePasswordResetToken(email, token);

  return { ok: true, data: { message: "Password updated successfully." } };
};
```

**Per requirements (OWASP Forgot Password Cheat Sheet):**
- Same response for existent/non-existent accounts (prevents enumeration).
- Token is cryptographically random (`randomBytes(32)`), single-use, time-limited (1 hour).
- Token stored as SHA-256 hash in DB (not plaintext).
- Reset URL built from trusted `NEXT_PUBLIC_SITE_URL` (not Host header — OWASP).
- New password validated with same policy as registration (min 8 chars).
- User must enter new password twice; both must match.
- Token invalidated (deleted) after use.
- No password sent in email.
- Do not lock account on forgot-password requests (prevents DoS).
- After reset, user signs in through normal login flow (no auto-login).

---

## 16. Change Password (Authenticated)

### src/actions/change-password.ts

```ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"],
});

export const changePassword = async (formData: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: { code: "AUTH_UNAUTHORIZED", message: "Not authenticated." } };
  }

  const parsed = changePasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return { ok: false, error: { code: "AUTH_INVALID_INPUT", message: "Invalid input." } };
  }

  const { currentPassword, newPassword } = parsed.data;

  const account = await prisma.authAccount.findFirst({
    where: { userId: session.user.id, provider: "credentials" },
  });

  if (!account?.hashedPassword) {
    return { ok: false, error: { code: "AUTH_PASSWORD_UNAVAILABLE", message: "Password change is not available for this account." } };
  }

  const match = await bcrypt.compare(currentPassword, account.hashedPassword);
  if (!match) {
    return { ok: false, error: { code: "AUTH_INVALID_CREDENTIALS", message: "Current password is incorrect." } };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.authAccount.update({
    where: {
      provider_providerAccountId: {
        provider: "credentials",
        providerAccountId: (session.user.email ?? "").toLowerCase(),
      },
    },
    data: { hashedPassword },
  });

  return { ok: true, data: { message: "Password changed." } };
};
```

**Per requirements (OWASP Authentication Cheat Sheet):**
- Authenticated only (checks `auth()`).
- Verifies current password before allowing change.
- Same password policy as registration (min 8 chars).
- Hash on server with bcrypt.
- No password logged.

---

## 17. Validation Schemas

### src/lib/validation/credentials.ts

```ts
import { z } from "zod";

const MIN_PASSWORD_LENGTH = 8;

export const signInCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(MIN_PASSWORD_LENGTH),
});

export type SignInCredentials = z.infer<typeof signInCredentialsSchema>;
```

### src/lib/validation/registration.ts

See [Section 13.1](#131-validation-schema-srclibvalidationregistrationts).

**Zod version note:** This guide uses Zod v3.x syntax. If your project uses Zod v4.x, the API is largely compatible; check the Zod v4 migration guide for any breaking changes.

---

## 18. Security Checklist

Based on `auth_requirements.md` Section 7, OWASP, and NIST:

Project references:
- [`security_requirements.md`](../../prds/04_authorization_privacy/security_requirements.md)
- [`privacy_threat_model.md`](../../prds/04_authorization_privacy/privacy_threat_model.md)
- [`observability_plan.md`](../../prds/06_operations/observability_plan.md)

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| **AUTH_SECRET** set, strong (>=32 bytes) | `openssl rand -base64 32`, in `.env.local` | Required |
| **HTTPS in production** | Vercel provides HTTPS by default | Required |
| **No password logging** | No `console.log` of passwords/hashes anywhere | Required |
| **Generic error messages** | "Invalid email or password." — no user enumeration | Required |
| **httpOnly cookie** | Auth.js sets httpOnly by default on session cookie | Automatic |
| **Secure cookie (prod)** | Auth.js sets Secure when `NEXTAUTH_URL` is https | Automatic |
| **SameSite cookie** | Auth.js defaults to `Lax` | Automatic |
| **Server-side validation** | Zod schemas in all Server Actions/Route Handlers | Required |
| **bcrypt for password hashing** | Cost factor 10 | Required |
| **Constant-time comparison** | `bcrypt.compare()` handles this | Automatic |
| **No secrets on client** | Passwords never sent to client; only session cookie | Required |
| **Session lifetime** | `maxAge: 60 * 60` **(1 hour)** in session config — limits role/status staleness window; see Section 7.2 and `backend_stack_decision.md` Guardrail #7. **Do NOT use 30 days.** | Required |
| **Rate limiting** | Required on login, registration, forgot-password (`per-IP + per-account`) | Required |
| **CSRF protection** | Auth.js v5 includes CSRF token validation | Automatic |
| **Reset URL from trusted base** | Use `NEXT_PUBLIC_SITE_URL` (not Host header) for password reset links (OWASP) | Required |
| **No session IDs in URLs** | Session exchanged via cookies only (OWASP Session Management) | Automatic |
| **Authorization policy layer** | Role + scope + object checks from `packages/policy` and matrix rules | Required |
| **Auth audit events** | Log `LOGIN_SUCCESS`, `LOGIN_FAILED`, `PASSWORD_RESET_*`, `ROLE_CHANGED` to `audit_log` | Required |

### Cookie Configuration (Auth.js v5)

Auth.js v5 uses cookie prefix `authjs` (changed from `next-auth` in v4). Cookie settings:

| Cookie | httpOnly | Secure | SameSite | Purpose |
|--------|----------|--------|----------|---------|
| `authjs.session-token` | Yes | Yes (prod) | Lax | JWT session |
| `authjs.callback-url` | Yes | Yes (prod) | Lax | OAuth callback URL |
| `authjs.csrf-token` | Yes | Yes (prod) | Lax | CSRF protection |

---

## 19. File Structure

```
project-root/
├── apps/
│   └── web/
│       ├── next.config.ts                  # output: "standalone"
│       ├── prisma.config.ts                # Prisma v7 config (DIRECT_URL)
│       ├── prisma/
│       │   ├── schema.prisma               # app_user, auth_account, user_role_assignment mappings
│       │   ├── migrations/
│       │   └── seed.ts
│       └── src/
│           ├── auth.config.ts
│           ├── auth.ts
│           ├── proxy.ts
│           ├── actions/
│           │   ├── auth.ts                 # OAuth baseline + credentials phase 2
│           │   ├── register.ts             # phase 2
│           │   ├── forgot-password.ts      # phase 2
│           │   ├── reset-password.ts       # phase 2
│           │   └── change-password.ts      # phase 2
│           ├── app/
│           │   ├── (auth)/
│           │   ├── admin/
│           │   └── api/auth/
│           └── lib/
│               ├── db/prisma.ts
│               ├── auth/access-context.ts
│               ├── auth/token-store.ts
│               └── validation/
├── packages/
│   ├── policy/                             # role/scope/object authorization checks
│   ├── domain/
│   └── db/
└── docs/
    └── prds/
```

---

## 20. Seed Script

### prisma/seed.ts

```ts
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import * as bcrypt from "bcrypt";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn("DATABASE_URL is not set; skipping seed.");
  process.exit(0);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const seedUsers = [
    {
      email: process.env.SUPERADMIN_EMAIL,
      password: process.env.SUPERADMIN_PASSWORD,
      name: process.env.SUPERADMIN_NAME ?? "Superadmin",
      role: UserRole.SUPERADMIN,
    },
    {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      name: process.env.ADMIN_NAME ?? "Admin",
      role: UserRole.ADMIN,
    },
    {
      email: process.env.EDITOR_EMAIL,
      password: process.env.EDITOR_PASSWORD,
      name: process.env.EDITOR_NAME ?? "Editor",
      role: UserRole.EDITOR,
    },
  ];

  for (const seed of seedUsers) {
    if (!seed.email || !seed.password) {
      console.warn(`Missing env for ${seed.role}; skipping.`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(seed.password, 10);

    await prisma.$transaction(async (tx) => {
      const user = await tx.appUser.upsert({
        where: { email: seed.email },
        create: {
          email: seed.email,
          fullName: seed.name,
          status: "ACTIVE",
        },
        update: {
          fullName: seed.name,
          status: "ACTIVE",
        },
      });

      await tx.authAccount.upsert({
        where: {
          provider_providerAccountId: {
            provider: "credentials",
            providerAccountId: seed.email.toLowerCase(),
          },
        },
        create: {
          userId: user.id,
          provider: "credentials",
          providerAccountId: seed.email.toLowerCase(),
          hashedPassword,
        },
        update: { hashedPassword, userId: user.id },
      });

      await tx.userRoleAssignment.upsert({
        where: { userId: user.id },
        create: { userId: user.id, role: seed.role },
        update: { role: seed.role },
      });
    });

    console.log(`Upserted ${seed.role} user:`, seed.email);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
```

Canonical references:
- [`database_schema_v3.md`](../../prds/03_data_model/database_schema_v3.md)
- [`authorization_matrix.md`](../../prds/04_authorization_privacy/authorization_matrix.md)

**package.json seed config:**
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

## 21. Verification Steps

After implementing all sections, run these checks:

### 21.1 Type Check
```bash
npx tsc --noEmit
```
Must pass with zero errors.

### 21.2 Lint
```bash
npm run lint
```
Must pass (ideally with `--max-warnings 0`).

### 21.3 Build
```bash
npm run build
```
Must succeed. Verify `output: "standalone"` produces `.next/standalone/`.

### 21.4 Database
```bash
npx prisma migrate dev --name wave1_auth_identity_alignment
npx prisma db seed
```

### 21.5 Functional Testing Checklist

| Flow | Steps | Expected |
|------|-------|----------|
| **OAuth login (MVP baseline)** | Click "Sign in with Google" | Redirect to Google, then back to `/admin/dashboard` |
| **Unauthenticated /admin access** | Visit `/admin/dashboard` without session | Redirect to `/sign-in` |
| **Role check** | Sign in as `EDITOR`, visit `/admin/settings` | Redirect to `/admin` (`ADMIN`/`SUPERADMIN` only) |
| **Logout** | Click "Sign Out" | Redirect to `/sign-in`, session cleared |
| **Registration (Phase 2)** | Go to `/register`, fill form, submit | User created with `PENDING` status |
| **Credentials login (Phase 2)** | Go to `/sign-in`, enter valid email/password | Redirect to `/admin/dashboard` |
| **Credentials login wrong password (Phase 2)** | Enter wrong password | "Invalid email or password." |
| **Forgot password (Phase 2)** | Submit email on `/forgot-password` | Generic success message; token stored in token-store |
| **Reset password (Phase 2)** | Click reset link, enter new password | Password updated; redirect to `/sign-in` |
| **Change password (Phase 2)** | Authenticated: enter current + new password | Password updated |
| **Session persistence** | Login, close browser, reopen `/admin` | Still authenticated (JWT in cookie) |
| **OAuth + existing email** | Existing user signs in with Google (same email) | Linked account when provider policy allows |

### 21.6 Security Verification

- [ ] `AUTH_SECRET` is set and not committed to git.
- [ ] No passwords appear in console logs or network responses.
- [ ] Error messages are generic (no user enumeration).
- [ ] Session cookie has httpOnly, Secure (in prod), SameSite=Lax.
- [ ] All Server Actions/Route Handlers validate input with Zod.
- [ ] bcrypt is used for all password hashing (cost factor >= 10).
- [ ] Password reset tokens expire after 1 hour and are single-use.
- [ ] Rate limiting is enabled for sign-in/register/reset endpoints.
- [ ] Auth events are written to `audit_log` without sensitive token payloads.
- [ ] `.env.local` is in `.gitignore`.

---

## Appendix A: Runtime Notes

`params`, `searchParams`, `cookies()`, and `headers()` are asynchronous in modern App Router code paths. Always type `params` and `searchParams` as `Promise<...>` and `await` them. Example:

```tsx
// Page with params
type Props = { params: Promise<{ id: string }> }

export default async function Page({ params }: Props) {
  const { id } = await params;
  // ...
}

// Using cookies
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme");
}
```

## Appendix B: Vercel Deployment Checklist

- [ ] `NEXTAUTH_URL` set to production URL in Vercel environment variables (if required by deployment mode).
- [ ] `AUTH_SECRET` set in Vercel environment variables.
- [ ] `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` set in Vercel environment variables.
- [ ] `DATABASE_URL` / `DIRECT_URL` set in Vercel environment variables.
- [ ] Google OAuth redirect URI includes production domain: `https://<your-domain>/api/auth/callback/google`.
- [ ] Build command: `npm run build`.

## Appendix C: Auth.js v5 Environment Variable Conventions

Auth.js v5 auto-detects variables with the `AUTH_` prefix:
- `AUTH_SECRET` — JWT encryption secret (required).
- `AUTH_GOOGLE_ID` — Google OAuth client ID (auto-mapped to Google provider's `clientId`).
- `AUTH_GOOGLE_SECRET` — Google OAuth client secret (auto-mapped to Google provider's `clientSecret`).
- `NEXTAUTH_URL` — Base URL for callbacks (required in non-Vercel environments).

When using the `AUTH_` prefix for OAuth providers, Auth.js automatically maps them, so you may omit `clientId`/`clientSecret` in the provider config:

```ts
// This works because AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET are auto-detected:
Google({
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
    };
  },
}),
```
