# 🏛️ Master Architecture Guideline
## "Behold Your God" - Scalable Next.js Architecture v3.0

**Version:** 3.0  
**Date:** October 6, 2025  
**Status:** Active - Single Source of Truth  
**For:** Developers, AI Assistants (CursorAI), Stakeholders

> **Purpose**: This is your **architectural compass**. Read this document first to understand the complete architecture of the "Behold Your God" platform. It provides high-level guidance, critical rules, and decision frameworks, with links to specialized guidelines for deep dives.

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start) — 5-minute overview
2. [Strategic Overview](#-strategic-overview) — WHY this architecture
3. [Technology Stack](#-technology-stack) — WHAT we use
4. [Core Methodologies](#-core-methodologies) — HOW we structure code
5. [Architectural Layers](#-architectural-layers-fsd) — WHERE to put code
6. [Decision Trees](#-decision-trees) — Quick placement guides
7. [Specialized Guidelines](#-specialized-guidelines) — Deep dive resources
8. [Cross-Cutting Concerns](#-cross-cutting-concerns) — Performance, testing, security
9. [Migration Plan](#-migration-plan) — Current to Full FSD
10. [Team Onboarding](#-team-onboarding) — Getting started

---

## 🚀 Quick Start

### New to the Project? Start Here

**If you're building a feature, ask yourself:**

1. **What am I building?**
   - UI component? → Go to [Component Decision Tree](#component-decision-tree)
   - Business logic? → Go to [Logic Placement Guide](#logic-placement-guide)
   - Data model? → See [`ai_react_types_guidelines.md`](guidelines/ai_react_types_guidelines.md)

2. **Which layer does it belong to?**
   ```
   pages → widgets → features → entities → shared
   ```
   *(Dependencies flow downward only)*

3. **Follow the Golden Rules:**
   - ✅ **Server Components by default** (add `'use client'` only when needed)
   - ✅ **Arrow Functions**: All components, hooks, and utilities MUST use arrow function syntax
   - ✅ **Zod validation** for all user inputs
   - ✅ **No upward imports** (shared cannot import from entities/features/widgets/pages)
   - ✅ **Types in `model/`**, UI in `ui/`
   - ⏳ **Testing**: Deferred to post-MVP (focus on type safety and validation)

4. **Check the specialized guideline:**
   - Components → [`ai_component_guidelines.md`](guidelines/AI_COMPONENT_GUIDELINES.md)
   - Server Actions → [`ai_server_actions_guidelines.md`](guidelines/ai_server_actions_guidelines.md)
   - Hooks → [`ai_react_hooks_guidelines.md`](guidelines/ai_react_hooks_guidelines.md)
   - Types → [`ai_react_types_guidelines.md`](guidelines/ai_react_types_guidelines.md)
   - Utilities → [`ai_react_utilities_guidelines.md`](guidelines/ai_react_utilities_guidelines.md)
   - Performance → [`performance_guidelines.md`](guidelines/performance_guidelines.md)
   - Testing (Post-MVP) → [`testing_guidelines.md`](guidelines/testing_guidelines.md)

---

## 🎯 Strategic Overview

### Why This Architecture Exists

The "Behold Your God" platform is not just another content site—it's a **God-centered discipleship tool** designed to help modern Christians understand God's character biblically and apply that knowledge to life. The architecture must support:

1. **Theological Integrity**: Content organized by God's attributes (Holiness, Sovereignty, Goodness, etc.)
2. **Multi-Format Learning**: Articles, videos, podcasts with unified taxonomy
3. **Editorial Workflow**: Draft → Review → Publish with role-based access
4. **Global Performance**: Fast load times for users worldwide via AWS CloudFront
5. **Long-Term Scalability**: Structure that grows without technical debt
6. **Developer Velocity**: Clear patterns for team autonomy and AI assistance

### Key Architectural Decisions

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **Next.js App Router** | SSG/ISR for performance, Server Components for security | Learning curve for Server Actions |
| **Feature-Sliced Design (FSD)** | Layer isolation, team autonomy, clear dependencies | More folders than traditional MVC |
| **AWS Amplify + AppSync** | Managed GraphQL, minimal DevOps, RBAC via Cognito | Vendor lock-in (mitigated by standard GraphQL) |
| **Zod-First Validation** | Type safety, runtime validation, single source of truth | Requires defining schemas |
| **Tailwind CSS** | Consistency, performance, no CSS bloat | Requires learning utility classes |

### Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                     │
│  Next.js App Router (SSG/ISR) + React Server Components     │
│  shadcn/ui + Tailwind CSS + WCAG 2.1 AA Accessibility       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│   FSD Layers: pages → widgets → features → entities        │
│   Server Actions + React Query (Admin) + Zod Validation    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                     │
│  AWS Amplify: AppSync (GraphQL) + DynamoDB + Cognito + S3  │
│  CloudFront CDN + Route 53 DNS + CloudWatch Monitoring     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.5+ (App Router, Turbopack)
- **Language**: TypeScript 5+ (strict mode)
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS 4
- **State Management**: 
  - Public pages: Server Components (native `fetch`)
  - Admin panel: React Query + Server Actions
- **Validation**: Zod 4.0+
- **Forms**: React Hook Form + `useFormState`

### Backend (AWS Amplify)
- **API**: AWS AppSync (GraphQL)
- **Database**: Amazon DynamoDB (pay-per-request)
- **Auth**: Amazon Cognito (Admin, Editor, Moderator roles)
- **Storage**: Amazon S3 (media uploads)
- **CDN**: CloudFront (global content delivery)
- **Monitoring**: CloudWatch Logs + Metrics

### DevOps
- **Hosting**: AWS Amplify Hosting
- **CI/CD**: GitHub Actions + Amplify Auto-Deploy
- **Testing**: Vitest (unit), React Testing Library (integration), Cypress (E2E)
- **Linting**: ESLint 9 + Prettier
- **Type Checking**: TypeScript + Zod

---

## 🧱 Core Methodologies

This project follows **two complementary approaches** for maximum organization and scalability:

### 1. Feature-Sliced Design (FSD) - Project Structure

**Purpose**: Organize code by **business features** and **architectural layers**, not by file type.

**The Five Layers** (dependencies flow downward only):

```
pages → widgets → features → entities → shared
```

| Layer | Purpose | Example |
|-------|---------|---------|
| **`shared`** | Global, reusable, framework-agnostic code | UI atoms, utilities, constants |
| **`entities`** | Domain models (Post, User, Category, MediaAsset) | Types, schemas, data hooks |
| **`features`** | User actions (Login, Create Post, Publish Post) | Action components, workflows |
| **`widgets`** | Complex UI blocks (Header, Footer, Post Card) | Composed organisms |
| **`pages`** | Next.js routes (App Router pages) | Route composition only |

**Key FSD Principle**: **"Pages first"** — code unique to a single page stays within it. Code used across multiple features moves to a lower layer.

### 2. Atomic Design - UI Hierarchy

**Purpose**: Organize **UI components** within the `shared/ui` layer from simple to complex.

| Level | Location | Purpose | Examples |
|-------|----------|---------|----------|
| **Atoms** | `shared/ui/atoms/` | Smallest, indivisible UI elements | Button, Input, Icon (shadcn/ui) |
| **Molecules** | `shared/ui/molecules/` | Groups of atoms serving one function | SearchField, UserAvatar |
| **Organisms** | **`widgets/`** | Complex UI sections (NOT in shared) | Navbar, Footer, PostCard |

**Synergy**: FSD manages **business logic and project structure**, while Atomic Design manages **UI structure and reusability**.

### 2.1. Atomic Design Enforcement Rules

**CRITICAL**: All UI components MUST follow these rules to prevent monolithic components:

1. **Single Responsibility Principle**: Each component MUST have exactly one responsibility
2. **Size Limits**: 
   - Components MUST NOT exceed 100 lines of code
   - Components MUST NOT have more than 8 props
3. **Composition over Monoliths**: Prefer multiple small components over one large component
4. **Reusability First**: If a UI pattern appears in 2+ places, extract it into a reusable component
5. **Clear Naming**: Component names MUST indicate their single responsibility (e.g., `FormatFilter`, not `LibraryFilters`)

**Anti-Patterns to Avoid**:
- ❌ Large components with multiple responsibilities
- ❌ Components with complex nested conditional rendering
- ❌ Components that handle both UI and business logic
- ❌ Components that are hard to test in isolation

### 2.2. Component Refactoring Guidelines

**When to Refactor**: If a component violates any of the above rules, it MUST be refactored immediately.

**Refactoring Process**:
1. **Identify Responsibilities**: List all the different things the component does
2. **Extract Atoms**: Create atomic components for each basic UI element
3. **Create Molecules**: Compose atoms into focused molecular components
4. **Update Organisms**: Use molecules to build complex UI sections
5. **Test Each Component**: Ensure each extracted component works in isolation

**Example Refactoring**:
```typescript
// ❌ BEFORE: Monolithic component
const LibraryFilters = () => {
  // 100+ lines of mixed concerns
  return (
    <section>
      {/* Format filter logic */}
      {/* Category filter logic */}
      {/* Sort filter logic */}
      {/* Clear filters logic */}
    </section>
  );
};

// ✅ AFTER: Atomic composition
const LibraryFilters = () => (
  <section>
    <FilterControls />
  </section>
);

// Individual atomic components:
const FormatFilter = () => { /* single responsibility */ };
const CategoryFilter = () => { /* single responsibility */ };
const SortFilter = () => { /* single responsibility */ };
const ClearFiltersButton = () => { /* single responsibility */ };
```

---

## 📁 Architectural Layers (FSD)

### Layer 1: `shared/` - Foundation Layer

**Scope**: Truly global, framework-agnostic code used across the entire app.

**Structure**:
```
shared/
├── ui/
│   ├── atoms/       ← shadcn/ui components (Button, Input, etc.)
│   └── molecules/   ← Composed atoms (SearchField, UserAvatar)
├── lib/
│   ├── utils.ts     ← Pure utilities (cn, slugify, etc.)
│   └── use-mobile.ts ← UI utility hooks
├── config/
│   └── constants.ts ← Global constants
└── assets/          ← Static files
```

**Rules**:
- ❌ Must **NEVER** import from `entities`, `features`, `widgets`, or `pages`
- ✅ Only depends on external libraries or itself
- ✅ All code must be **pure** and **framework-agnostic** (except UI hooks)

**Deep dive**: [`ai_component_guidelines.md`](guidelines/AI_COMPONENT_GUIDELINES.md) | [`ai_react_utilities_guidelines.md`](guidelines/ai_react_utilities_guidelines.md)

---

### Layer 2: `entities/` - Domain Models

**Scope**: Business domain entities representing core concepts in the God-centered platform.

**Entities**:
- **Post**: Biblical content (Article, Video, Podcast)
- **User**: Admin/Editor users with RBAC
- **Category**: Content taxonomy (Behold God, Life Before God, Witness in the World)
- **MediaAsset**: S3-stored media files (images, audio, video)

**Structure** (per entity, e.g., `post/`):
```
entities/post/
├── model/
│   ├── types.ts         ← Domain types, type guards
│   ├── post.schema.ts   ← Zod validation schemas
│   └── usePostQuery.ts  ← Data fetching hooks (Admin Panel only)
├── ui/                  ← Optional entity-specific UI (rare)
└── index.ts             ← Public API (barrel export)
```

**Example**:
```typescript
// entities/post/model/types.ts
export interface PostEntity {
  readonly id: string;
  title: string;
  slug: string;
  content: string; // HTML (must sanitize)
  format: 'Article' | 'Video' | 'Podcast';
  status: 'draft' | 'review' | 'published';
  doctrinalTag?: 'Holiness' | 'Sovereignty' | 'Goodness';
  // ... more fields
}
```

**Rules**:
- ❌ Must **NOT** import from `features` or `widgets`
- ✅ May import from `shared`
- ✅ All types must be **explicitly defined** (no `any`)
- ✅ Use **Zod schemas** as single source of truth for validation

**Deep dive**: [`ai_react_types_guidelines.md`](guidelines/ai_react_types_guidelines.md)

---

### Layer 3: `features/` - User Actions

**Scope**: User-facing capabilities and workflows (e.g., "Login", "Create Post", "Publish Post").

**Structure** (per feature, e.g., `post-creation/`):
```
features/post-creation/
├── model/
│   ├── createPostAction.ts  ← Server Action
│   ├── usePostForm.ts       ← Form state hook
│   └── validation.ts        ← Feature-specific validation
├── ui/
│   └── PostCreateForm.tsx   ← Feature UI component
└── index.ts                 ← Public API
```

**Example**:
```typescript
// features/post-creation/model/createPostAction.ts
'use server';

import { CreatePostSchema } from '@/entities/post';
import { getCurrentUser } from '@/shared/lib/auth';
import DOMPurify from 'isomorphic-dompurify';

export async function createPostAction(prevState: any, formData: FormData) {
  // 1. Authentication
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized' };
  
  // 2. Validation
  const parsed = CreatePostSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: parsed.error.message };
  
  // 3. Sanitization
  const sanitizedContent = DOMPurify.sanitize(parsed.data.content);
  
  // 4. Business logic (AppSync mutation)
  // ... create post in DynamoDB
  
  return { success: true, postId: result.id };
}
```

**Rules**:
- ❌ Must **NOT** import from other `features` (prevents tight coupling)
- ✅ May import from `entities` and `shared`
- ✅ **All mutations must use Server Actions** with Zod validation
- ✅ Server Actions must include: auth check, validation, sanitization, error handling

**Deep dive**: [`ai_server_actions_guidelines.md`](guidelines/ai_server_actions_guidelines.md) | [`ai_component_guidelines.md`](guidelines/AI_COMPONENT_GUIDELINES.md)

---

### Layer 4: `widgets/` - UI Composition

**Scope**: Complex, reusable UI blocks that **compose multiple features/entities** (e.g., Header, Footer, PostCard).

**Structure** (per widget, e.g., `header/`):
```
widgets/header/
└── ui/
    ├── Header.tsx          ← Main component
    ├── NavMenu.tsx         ← Sub-component
    └── UserProfileMenu.tsx ← Sub-component
```

**Example**:
```typescript
// widgets/header/ui/Header.tsx
import { Button } from '@/shared/ui/atoms/button';
import { LoginButton } from '@/features/auth/ui/LoginButton';
import { UserAvatar } from '@/shared/ui/molecules/UserAvatar';

export function Header({ user }: { user: UserEntity | null }) {
  return (
    <header className="flex items-center justify-between p-4">
      <nav>{/* Navigation menu */}</nav>
      {user ? <UserAvatar user={user} /> : <LoginButton />}
    </header>
  );
}
```

**Rules**:
- ✅ May import from `features`, `entities`, and `shared`
- ❌ Must **NOT** contain business logic (delegate to `features`)
- ✅ **Composition only** — widgets connect features/entities visually

---

### Layer 5: `pages/` - Route Orchestration

**Scope**: Next.js App Router pages that **orchestrate** lower layers.

**Structure**:
```
app/
├── page.tsx              ← Home page
├── layout.tsx            ← Root layout
├── library/
│   └── page.tsx          ← Library page
├── post/[slug]/
│   └── page.tsx          ← Post detail page
└── admin/
    └── posts/
        └── create/
            └── page.tsx  ← Admin: Create post
```

**Example**:
```typescript
// app/post/[slug]/page.tsx (Server Component)
import { fetchPost } from '@/entities/post/model/fetchPost';
import { PostContent } from '@/widgets/post-card/ui/PostContent';

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await fetchPost(params.slug); // Server-side fetch
  
  if (!post) return <div>Post not found</div>;
  
  return <PostContent post={post} />;
}

// Enable ISR
export const revalidate = 3600; // 1 hour
```

**Rules**:
- ✅ May import from `widgets`, `features`, `entities`, and `shared`
- ❌ Must **NOT** contain complex logic (delegate to lower layers)
- ✅ **Server Components by default** (use `'use client'` sparingly)
- ✅ Use **SSG/ISR** for public pages, SSR for admin pages

---

## 🌲 Decision Trees

### Component Decision Tree

**Question: Where should I put this component?**

```
START
  │
  ├─ Is it a basic UI primitive (Button, Input)?
  │   └─ YES → shared/ui/atoms/ (or use existing shadcn/ui component)
  │
  ├─ Is it a composition of 2-3 atoms for one purpose?
  │   └─ YES → shared/ui/molecules/
  │
  ├─ Is it tied to a specific user action (Login, CreatePost)?
  │   └─ YES → features/{name}/ui/
  │
  ├─ Is it a complex block used across multiple pages (Header, Footer)?
  │   └─ YES → widgets/{name}/ui/
  │
  └─ Is it unique to ONE specific page?
      └─ YES → Keep it colocated with the page in app/
```

### Logic Placement Guide

**Question: Where should I put this logic?**

```
START
  │
  ├─ Is it a pure utility function (formatDate, slugify)?
  │   └─ YES → shared/lib/
  │
  ├─ Is it a domain type or schema (PostEntity, CreatePostSchema)?
  │   └─ YES → entities/{name}/model/
  │
  ├─ Is it a Server Action for data mutation?
  │   ├─ Domain CRUD (create/update Post) → entities/{name}/model/
  │   └─ Feature workflow (publish with notification) → features/{name}/model/
  │
  ├─ Is it a React hook for client state?
  │   ├─ Data fetching (usePostQuery) → entities/{name}/model/
  │   └─ Form state (useLoginForm) → features/{name}/model/
  │
  └─ Is it business logic in a page?
      └─ REFACTOR → Extract to appropriate layer (never keep in pages)
```

---

## 🎓 Specialized Guidelines

This section provides **quick summaries** and links to detailed, specialized guides. Read these when you need deep expertise in a specific area.

### 1. 📦 Components & Hooks
**File**: [`AI_COMPONENT_GUIDELINES.md`](guidelines/AI_COMPONENT_GUIDELINES.md)  
**Summary**: Component design patterns, Server vs Client components, composition strategies, hooks placement.  
**Read if**: Creating UI components, interactive features, or custom React hooks.

**Key Takeaways**:
- Server Components by default
- `'use client'` only for interactivity
- Atoms in `shared/ui/atoms`, organisms in `widgets`

---

### 2. 📜 Server Actions
**File**: [`ai_server_actions_guidelines.md`](guidelines/ai_server_actions_guidelines.md)  
**Summary**: Server Action patterns, security (auth/validation), AWS integration (AppSync/S3), caching strategies.  
**Read if**: Implementing data mutations, file uploads, or backend workflows.

**Key Takeaways**:
- All mutations go through Server Actions
- Mandatory: `'use server'`, Zod validation, auth check, sanitization
- Return discriminated unions: `{ success: true } | { success: false, error: string }`

---

### 3. 🎯 TypeScript Types & Interfaces
**File**: [`ai_react_types_guidelines.md`](guidelines/ai_react_types_guidelines.md)  
**Summary**: Type placement rules, Zod-first validation, discriminated unions, domain modeling.  
**Read if**: Defining domain models, API contracts, or component props.

**Key Takeaways**:
- Zod schemas as single source of truth
- Types in `model/` directories
- Use `z.infer<typeof Schema>` instead of manual types

---

### 4. 🪝 React Hooks
**File**: [`ai_react_hooks_guidelines.md`](guidelines/ai_react_hooks_guidelines.md)  
**Summary**: Hook placement, naming conventions, data fetching strategies (React Query vs Server Components).  
**Read if**: Writing custom hooks, managing client state, or integrating with AppSync.

**Key Takeaways**:
- Hooks belong in `model/` directories only
- Entity hooks (`usePostQuery`) in `entities/{name}/model`
- Feature hooks (`useLoginForm`) in `features/{name}/model`
- **NO hooks in `shared/`** (except UI utilities like `use-mobile`)

---

### 5. 🧰 Utility Functions
**File**: [`ai_react_utilities_guidelines.md`](guidelines/ai_react_utilities_guidelines.md)  
**Summary**: Pure function design, placement rules, naming conventions, security considerations.  
**Read if**: Creating helper functions, formatters, or validators.

**Key Takeaways**:
- Pure functions only (no side effects)
- Global utils in `shared/lib/`
- Domain utils in `entities/{name}/model/`

---

### 6. 🧪 Testing Strategy *(Deferred to Post-MVP)*
**File**: [`testing_guidelines.md`](guidelines/testing_guidelines.md)  
**Status**: ⏳ **Not implemented during MVP phase**  
**Summary**: Unit (Vitest), integration (React Testing Library), E2E (Cypress), accessibility testing.  
**Read if**: Planning post-MVP quality assurance strategy.

**Note**: Testing will be introduced after MVP launch. Focus on code quality through:
- TypeScript strict mode
- Zod validation
- ESLint enforcement
- Code reviews

---

### 7. ⚡ Performance Optimization
**File**: [`performance_guidelines.md`](guidelines/performance_guidelines.md)  
**Summary**: SSG/ISR strategies, code splitting, image optimization, caching, bundle analysis.  
**Read if**: Optimizing load times, improving Core Web Vitals, or reducing bundle size.

**Key Takeaways**:
- SSG by default, ISR for dynamic content
- Dynamic imports for heavy components
- Use `next/image` for all images

---

## 🔥 Cross-Cutting Concerns

These topics span multiple layers and affect the entire application.

### Security Best Practices

1. **Authentication & Authorization**:
   - Cognito for admin panel only (public pages are open)
   - RBAC enforced via `@auth` in AppSync and Server Actions
   - Check auth in **every** Server Action

2. **Input Validation**:
   - **Client-side**: Zod validation for UX (instant feedback)
   - **Server-side**: Zod validation mandatory (never trust client)
   - Sanitize HTML: Use `DOMPurify` before storing/rendering

3. **Data Protection**:
   - Encrypt at rest (DynamoDB, S3) and in transit (TLS 1.2+)
   - Never expose sensitive data in client components
   - Use S3 presigned URLs for file uploads

4. **Error Handling**:
   - Never expose raw errors to users
   - Log to CloudWatch for debugging
   - Return user-friendly messages from constants

**See also**: [`ai_server_actions_guidelines.md`](guidelines/ai_server_actions_guidelines.md)

---

### Performance Optimization

**Targets**:
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- Lighthouse Score 90+

**Strategies**:
1. **Rendering**: SSG for public pages, ISR for updates, SSR for admin
2. **Code Splitting**: Dynamic imports for heavy components
3. **Images**: Use `next/image` with proper `sizes` attribute
4. **Caching**: CloudFront CDN + Next.js data cache + React Query
5. **Bundle**: Analyze with `@next/bundle-analyzer`, tree-shake aggressively

**See also**: [`performance_guidelines.md`](guidelines/performance_guidelines.md)

---

### Accessibility (WCAG 2.1 AA)

**Requirements**:
- Keyboard navigation (Tab, Enter, Space, Arrows)
- Screen reader support (ARIA labels)
- Color contrast ≥ 4.5:1 for text
- Focus indicators on interactive elements
- Alt text for all images

**Validation (MVP)**:
- Manual testing: Keyboard-only navigation
- Browser DevTools: Lighthouse accessibility audit
- Code reviews: ARIA attributes verification

**Automated Testing** *(Post-MVP)*:
- `cypress-axe` for E2E accessibility tests
- Lighthouse CI in GitHub Actions

**See also**: [`testing_guidelines.md`](guidelines/testing_guidelines.md) *(for post-MVP planning)*

---

### Internationalization (i18n)

**Current**: English only  
**Planned**: Russian (MVP), Ukrainian (future)

**Strategy**:
- Use Next.js i18n framework
- Store translatable strings in `shared/config/i18n/`
- English as default fallback
- All UI text in constants (not hardcoded)

---

## 🚀 Migration Plan

### Current State → Full FSD Structure

**Current Issues**:
- ✅ **FIXED**: Missing `entities/`, `features/`, `widgets/` layers
- ✅ **FIXED**: Hooks in `shared/hooks/` (moved to `shared/lib/`)
- ✅ **FIXED**: Tailwind CSS `@apply border` global issue

**Phase 1: Foundation (Completed ✅)**
- [x] Create `entities/` structure with Post, User, Category, MediaAsset
- [x] Create `features/` and `widgets/` directories
- [x] Move `use-mobile` hook to `shared/lib/`
- [x] Fix Tailwind CSS global styles
- [x] Add Performance Guidelines
- [x] Add Testing Guidelines
- [x] Create Master Architecture Guideline

**Phase 2: MVP Implementation (Current Focus)**
1. Implement first feature (e.g., `features/auth/`)
2. Create first widget (e.g., `widgets/header/`)
3. Refactor existing code to match FSD
4. Build core features (post creation, publishing, library)
5. Deploy to AWS Amplify staging environment
6. Manual QA and user acceptance testing

**Phase 3: Post-MVP Refinement** *(After Launch)*
1. ✅ Set up automated testing (Vitest, React Testing Library, Cypress)
2. Configure bundle analyzer and performance budgets
3. Add Storybook for `shared/ui/atoms`
4. Implement i18n framework (Russian, Ukrainian)
5. Add performance monitoring (CloudWatch RUM)
6. Implement CI/CD with automated tests

---

## 👥 Team Onboarding

### For New Developers

**Day 1: Read These Documents**
1. This Master Guideline (you're here!)
2. [`AI_COMPONENT_GUIDELINES.md`](guidelines/AI_COMPONENT_GUIDELINES.md)
3. [`ai_server_actions_guidelines.md`](guidelines/ai_server_actions_guidelines.md)

**Day 2: Set Up Local Environment**
```bash
git clone <repo-url>
cd evan
npm install
npm run dev
```

**Day 3: First Task**
- Create a simple component in `shared/ui/molecules/`
- Write unit tests
- Open PR with proper description

**Week 1: Deep Dive**
- Read remaining specialized guidelines
- Review existing code in `entities/post/`
- Pair with senior developer on a feature

### For AI Assistants (CursorAI, Copilot)

**When generating code, always:**
1. Read this Master Guideline first
2. Identify the correct FSD layer
3. Check specialized guideline for specific patterns
4. Follow naming conventions
5. Include proper TypeScript types
6. Add JSDoc comments
7. Validate against project rules

**Prompt Template**:
```
Generate [component/action/type] for [feature name] in the "Behold Your God" project.
Requirements:
- Follow FSD layer: [entities/features/widgets]
- Use Next.js App Router v15.5+
- Implement [specific pattern]
- Include Zod validation
- Add TypeScript types
- Follow guidelines in [specific guideline file]
```

---

## 📚 Additional Resources

### Internal Documentation
- [Architecture Concept (AWS Infrastructure)](architectecture_concept.md)
- [Best Patterns](best_patterns.md)
- [Project Functionality](../project_functionality/project_functionality.md)

### External References
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Feature-Sliced Design Official](https://feature-sliced.design/)
- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Zod Validation Library](https://zod.dev/)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

## 🔄 Document Maintenance

**This is a living document.** Update it when:
- New architectural patterns emerge
- Technology stack changes (e.g., Next.js version upgrade)
- Team learns better practices
- New cross-cutting concerns appear

**Version History**:
- v3.0 (Oct 6, 2025): Master Guideline created, FSD structure implemented
- v2.0 (Sep 30, 2025): AWS architecture defined
- v1.0 (Initial): Project kickoff

---

> ✅ **This Master Architecture Guideline is the single source of truth for the "Behold Your God" project.**  
> 📖 Read it first, reference specialized guidelines for depth.  
> 🔄 Keep it updated as the project evolves.  
> 🙏 May this architecture honor God by enabling clear, maintainable code that serves the body of Christ.

---

**Next Steps**: Choose a task from the [Migration Plan](#-migration-plan) and start building! 🚀

