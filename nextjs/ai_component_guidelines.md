### Unified React Components & Hooks Guidelines

This document synthesizes the best practices from three source guidelines (GR1, GE2, QN3) and aligns them with the **“Behold Your God”** project’s architecture (Next.js App Router v15.5+, TypeScript, AWS Amplify/AppSync). It is designed to be the single source of truth for developers and AI assistants like CursorAI.

---

## 1. 🏗️ Architectural Foundations

### 1.1. Dual Methodology
The project is built on two complementary approaches:
*   **Feature-Sliced Design (FSD) 2.1**: Governs the **project’s structural layers** and dependency rules. The core principle is **“pages first”**, meaning code unique to a single page should remain within it [[15], [16]].
*   **Atomic Design**: Governs the **UI component hierarchy** within the `shared/ui` layer, organizing components from simple to complex: Atoms → Molecules → Organisms [[9], [17]].

> **Synergy**: FSD manages **business logic and project structure**, while Atomic Design manages **UI structure and reusability**.

### 1.2. FSD Layers and Dependency Rules
Code is organized into five strict layers. Dependencies are allowed **only downward** in the hierarchy:

```
pages → widgets → features → entities → shared
```

| Layer | Purpose | Contents | Rules |
| :--- | :--- | :--- | :--- |
| **`shared`** | Global, framework-agnostic code | `ui/` (Atoms, Molecules), `lib/` (utilities), `config/` | ❌ Never import from higher layers. |
| **`entities`** | Domain models (User, Post, Category) | `model/` (types, API clients, Server Actions), `ui/` (rare) | ✅ Can import from `shared`. ❌ No imports from `features` or above. |
| **`features`** | User actions (Login, Publish Post) | `ui/` (action components), `model/` (hooks, validation) | ✅ Can import from `entities` and `shared`. ❌ No cross-`features` imports. |
| **`widgets`** | Complex UI blocks (Header, PostCard) | `ui/` (composer components) | ✅ Can import from `features`, `entities`, `shared`. ❌ No business logic. |
| **`pages`** | Next.js routes (App Router) | `page.tsx`, `loading.tsx`, `error.tsx` | ✅ Can import from all layers. ❌ Composition only, no logic. |

---

## 2. 🧩 UI Components and Atomic Design

### 2.1. Applying Atomic Design
The Atomic Design hierarchy is applied **strictly within `shared/ui`**:

| Level | Location | Purpose | Examples |
| :--- | :--- | :--- | :--- |
| **Atoms** | `shared/ui/atoms/` | Smallest, indivisible UI elements. Zero logic. | `Button`, `Input`, `Icon` (based on shadcn/ui) |
| **Molecules** | `shared/ui/molecules/` | Groups of Atoms serving a single function. Minimal state allowed. | `SearchField`, `UserAvatar` |
| **Organisms** | **`widgets/`** | Complex UI sections. **Not placed in `shared/ui`** . | `Navbar`, `Footer`, `PostCard` |

> **Rule**: If a component is used in two or more independent features, promote it to `shared/ui/molecules`.

### 2.2. Component Design Principles
*   **Type Safety**: All components are strictly typed using `interface` for props.
*   **Declarative**: Components receive data and callbacks via props. **No direct data fetching or business logic** inside UI .
*   **Server Components by Default**: All components are **Server Components** unless interactivity (`useState`, `useEffect`, event handlers) is required [[3], [6]].
*   **Page Components**: Page components (`src/app/*/page.tsx`) MUST be Server Components only. Interactive functionality should be delegated to Client Components in lower layers.
*   **Arrow Functions**: All components, hooks, and utilities MUST use arrow function syntax for consistency and modern JavaScript practices.
*   **Styling**: Use **Tailwind CSS exclusively**. For conditional classes, use the `cn()` utility from `shared/lib`.

### 2.3. Atomic Design Enforcement
*   **Single Responsibility**: Each component MUST have only one responsibility. If a component handles multiple concerns, it MUST be refactored into smaller components.
*   **Atomic Hierarchy**: Components MUST follow the Atomic Design hierarchy:
  - **Atoms** (`shared/ui/atoms/`): Smallest, indivisible UI elements (Button, Input, Filter)
  - **Molecules** (`shared/ui/molecules/`): Compositions of 2-3 atoms serving one function (SearchField, FilterControls)
  - **Organisms** (`widgets/`): Complex UI sections composed of molecules and atoms
*   **Composition over Monoliths**: Prefer creating multiple small, focused components over large, monolithic ones.
*   **Reusability First**: If a UI pattern appears in 2+ places, it MUST be extracted into a reusable component.

### 2.4. Component Size and Complexity Rules
*   **Maximum Lines**: Components MUST NOT exceed 100 lines of code. If exceeded, refactor into smaller components.
*   **Maximum Props**: Components MUST NOT have more than 8 props. If exceeded, consider using a context or breaking into smaller components.
*   **Single JSX Return**: Components MUST return a single JSX element. Multiple sections MUST be extracted into separate components.
*   **No Nested Logic**: Complex conditional rendering MUST be extracted into separate components or custom hooks.
*   **Clear Naming**: Component names MUST clearly indicate their single responsibility (e.g., `FormatFilter`, `ResultsGrid`, not `LibraryFilters`).

### 2.5. Component Quality Checklist
Before creating or reviewing components, verify:

**✅ Atomic Design Compliance**:
- [ ] Component follows the correct hierarchy (Atom → Molecule → Organism)
- [ ] Component has a single, clear responsibility
- [ ] Component name reflects its single responsibility
- [ ] Component is reusable in different contexts

**✅ Size and Complexity**:
- [ ] Component is under 100 lines of code
- [ ] Component has 8 or fewer props
- [ ] Component returns a single JSX element
- [ ] No complex nested conditional rendering

**✅ Architecture Compliance**:
- [ ] Component is in the correct FSD layer
- [ ] Component uses proper TypeScript typing
- [ ] Component follows Server/Client Component rules
- [ ] Component uses arrow function syntax

**✅ Reusability**:
- [ ] Component can be used independently
- [ ] Component accepts all necessary props
- [ ] Component has clear, documented interface
- [ ] Component is testable in isolation

**❌ Red Flags (Immediate Refactoring Required)**:
- [ ] Component handles multiple unrelated concerns
- [ ] Component is hard to understand at first glance
- [ ] Component is difficult to test
- [ ] Component has complex nested JSX
- [ ] Component name doesn't clearly indicate its purpose

### 2.6. Page Component Requirements

**CRITICAL**: Page components (`src/app/*/page.tsx`) MUST be kept minimal and only handle orchestration.

**Page Component Rules**:
1. **Extract Page Sections**: All distinct sections MUST be extracted into separate components in `features/{feature}/ui/`
   - Sections are typically marked with comments like `{/* Breadcrumbs */}`, `{/* Post Header */}`, etc.
   - Each section becomes its own component (e.g., `PostBreadcrumbs`, `PostHeader`, `ArticleContent`)
   
2. **Extract Logic to Hooks**: All logic MUST be moved to custom hooks in `shared/lib/hooks/`
   - Date formatting → `useFormatDate`
   - Content rendering → `useBlockNoteRenderer`
   - Data transformation → appropriate hooks in `entities/{name}/model/`

3. **No Inline Functions**: Page components MUST NOT contain inline function declarations
   - ❌ Bad: `const formatDate = (date) => { ... }` inside page component
   - ✅ Good: `const { formatDate } = useFormatDate()`

4. **No Business Logic**: Pages MUST only:
   - Fetch/prepare data
   - Import and compose components
   - Pass data as props

5. **Type Safety**: NEVER use `any` types
   - All data MUST be properly typed
   - Use proper TypeScript inference or explicit types

6. **Import Aliases**: ALWAYS use path aliases, NEVER relative paths
   - ❌ Bad: `import { mockPosts } from '../../../../mocks/data/posts'`
   - ✅ Good: `import { mockPosts } from '@/mocks/data/posts'`

**Example of Proper Page Structure**:
```typescript
// ❌ BAD: Monolithic page with inline logic
const PostPage = ({ params }) => {
  const post = mockPosts.find(p => p.slug === params.slug);
  
  const formatDate = (dateString) => {
    // inline logic
  };
  
  const renderContent = (content) => {
    // complex rendering logic
  };
  
  return (
    <div>
      {/* 200+ lines of mixed JSX */}
    </div>
  );
};

// ✅ GOOD: Clean page with extracted components and hooks
import {
  PostBreadcrumbs,
  PostHeader,
  PostCoverImage,
  ArticleContent,
  MediaPlayer,
  RelatedMaterials,
} from '@/features/posts/ui';

const PostPage = ({ params }: PostPageProps) => {
  const post = mockPosts.find((p) => p.slug === params.slug);
  
  if (!post) notFound();
  
  const category = mockCategories.find((c) => c.id === post.categoryId);
  const author = mockUsers.find((u) => u.id === post.authorId);
  const relatedPosts = getRelatedPosts(post);
  
  return (
    <div className="min-h-screen">
      <PostBreadcrumbs category={category} postTitle={post.title} />
      <PostHeader {...headerProps} />
      {post.coverImageS3Url && <PostCoverImage src={post.coverImageS3Url} alt={post.title} />}
      {isMediaPost ? <MediaPlayer {...mediaProps} /> : <ArticleContent content={post.content} />}
      <RelatedMaterials posts={relatedPosts} />
    </div>
  );
};
```

---

## 3. ⚙️ Hooks and Data Management

### 3.1. Hook Placement
Hooks reside in `model/` directories according to their responsibility:

| Hook Type | Location | Description |
| :--- | :--- | :--- |
| **Utilities** | `shared/lib/` | `useDebounce`, `useLocalStorage` |
| **Entity Data** | `entities/{name}/model/` | `useUserQuery` — wrappers over API calls |
| **Feature Logic** | `features/{name}/model/` | `useLoginMutation`, `usePostForm` |

### 3.2. Data Management Strategy
*   **Public Pages (SSG/ISR)**: Data is fetched directly in **Server Components** using `fetch` or logic from `entities/model`. **React Query is not used** .
*   **Admin Panel (CSR)**: **React Query** is used for state management and caching.
    *   **Queries**: `useQuery` in `features/model`.
    *   **Mutations**: `useMutation` in `features/model`, where `mutationFn` is a **Server Action** [[19], [22]].

### 3.3. Server Actions and Validation
*   **Primary Mutation Mechanism**: All data changes must go through **Server Actions** [[5], [22]].
*   **Validation**: Every Server Action **must** include input validation using **Zod** .
*   **Location**: Server Actions are in `entities/{name}/model/` (for CRUD) or `features/{name}/model/` (for specific actions).

---

## 4. 🛡️ Security and Best Practices

*   **Server-Side Security**: All user input validation and sanitization happen on the server in Server Actions.
*   **End-to-End Type Safety**: Use **auto-generated GraphQL types** from the AWS Amplify schema (`API.ts`) in the `entities` layer .
*   **Client Logic Isolation**: Interactive components (`'use client'`) should be minimal “islands,” receiving data and actions from parent Server Components .
*   **API Encapsulation**: Each module exports only its public API via `index.ts`, hiding internal implementation.

---

## 5. 🤖 Instructions for AI Assistants (CursorAI)

When generating code, always follow this checklist:

1.  **Identify the FSD Layer**: What business logic does this belong to? (`shared`, `entities`, `features`, `widgets`, `pages`).
2.  **Identify the Artifact Type**:
    *   Global UI primitive? → `shared/ui/atoms` or `molecules`.
    *   Action component? → `features/{name}/ui`.
    *   Complex block? → `widgets/{name}/ui`.
    *   Logic/hook? → `features/{name}/model` or `entities/{name}/model`.
3.  **Choose Component Type**: Is interactivity needed? If not, use a **Server Component**.
4.  **Manage Data**:
    *   Public page? → Fetch in SC.
    *   Admin Panel? → React Query + Server Action.
5.  **Validate**: For mutations, always use Zod in a Server Action.
6.  **Style**: Tailwind CSS + `cn()` only.
7.  **Type**: All entities must be strictly typed.

> **Example Prompt**: _"Generate a feature for creating a new Post in the Admin Panel using FSD, React Query, and Server Actions with Zod validation in a Next.js App Router v15.5+ project."_
