# 🪝 React Hooks Guidelines  
**For “Behold Your God” Project**  
*Next.js App Router v15.5+ • TypeScript • FSD + Atomic Design • AWS Amplify Stack*  
> **Purpose**: This document defines **where, how, and why** to create React hooks in the project. It is optimized for **human developers** and **AI assistants** (e.g., CursorAI) to generate **architecturally correct, secure, and maintainable** client-side logic.  
> **Version**: 1.0  
> **Status**: Approved

---

## 1. 🎯 Core Philosophy

- **Hooks = logic containers**, **not UI**. They belong **only** in `model/` directories of `entities/` or `features/`.
- **Server Components are default**. Use hooks **only** when interactivity is required (e.g., Admin Panel, client-side forms, dynamic filters).
- **FSD dependency flow is sacred**:  
  `pages` → `widgets` → `features` → `entities` → `shared`  
  **No upward or cross-feature imports**.
- **Security-first**: All mutations go through **Server Actions** with **Zod validation**; hooks never bypass authZ/authN.
- **Performance-first**: Leverage **React Query caching** in Admin Panel; avoid unnecessary re-renders (`useCallback`, `useMemo`).

---

## 2. 📁 Placement Rules (FSD + Atomic Design)

| Layer       | Path Example                                      | Allowed? | Purpose |
|-------------|---------------------------------------------------|----------|--------|
| `shared/`   | `src/shared/lib/`                                 | ❌       | Must be **React-agnostic**. Only pure utilities (`formatDate`, `cn`, etc.). |
| `entities/` | `src/entities/post/model/usePostQuery.ts`         | ✅       | **Domain logic**: data fetching, type-safe AppSync wrappers, entity mutations. |
| `features/` | `src/features/admin-post/model/usePostPublish.ts` | ✅       | **Use-case logic**: form state, validation, composition of entity hooks. |
| `widgets/`  | —                                                 | ❌       | **Composition only**. Must **consume**, not define, hooks. |
| `pages/`    | —                                                 | ❌       | **Orchestration only**. Never contain custom hooks. |

> ✅ **Rule**: Every hook **must** be in a `model/` subdirectory of an `entity` or `feature`.

---

## 3. 🧪 Hook Design Standards

### 3.1 Naming Convention
- Format: `use{Domain}{Action}`  
  Examples: `usePostPublish`, `useUserSearch`, `useMediaUpload`.
- File: `use{Name}.ts` (or `.tsx` only if JSX is embedded — **rarely**).

### 3.2 TypeScript Requirements
- All inputs and outputs **must be explicitly typed**.
- **Arrow Functions**: All hooks MUST use arrow function syntax for consistency.
- Prefer `interface` for public return types:
  ```ts
  interface UsePostPublishResult {
    publish: (id: string) => Promise<void>;
    isPublishing: boolean;
    error: string | null;
  }
  ```

### 3.3 Return Values
Hooks **must return only**:
- Data (`data: Post[] | undefined`)
- State flags (`isLoading`, `isError`)
- Callbacks (`refetch`, `submit`)
- **Never return JSX, styles, or components**.

---

## 4. 🔄 Data Strategy by Context

### 4.1 Public Pages (SSG/SSR — Server Components)
- **Do not use hooks** for primary data fetching.
- Use **async Server Components** with `fetch` or direct model calls.
- Reason: Leverages Next.js built-in caching, streaming, and SEO.

### 4.2 Admin Panel (Client Components)
- **React Query is mandatory** for all data operations.
- **Queries**:  
  - Location: `entities/{name}/model/use{Entity}Query.ts`  
  - Use `graphqlRequest` from `shared/lib/graphql` or Server Actions.
  - Define and export query keys:  
    ```ts
    export const POST_QUERY_KEYS = { all: ['posts'] as const };
    ```
- **Mutations**:  
  - Wrap **Server Actions** as `mutationFn`.  
  - Implement cache invalidation in `onSuccess`:
    ```ts
    onSuccess: () => queryClient.invalidateQueries({ queryKey: POST_QUERY_KEYS.all })
    ```
- **Optimistic updates** are encouraged for UX (e.g., draft creation).

---

## 5. 🛡️ Security & Validation

- **Client-side validation (Zod)** is for **UX only**.
- **Server-side validation is mandatory**: All Server Actions **must** validate input with Zod.
- **Never expose sensitive data** in hooks (e.g., `user.role`, draft content) without Cognito RBAC checks (enforced in GraphQL `@auth` or Server Actions).
- **Sanitize rich text** before rendering (use `DOMPurify` if HTML is stored).

---

## 6. ⚠️ Anti-Patterns (Strictly Forbidden)

| Anti-Pattern | Why It’s Bad | Correct Approach |
|-------------|--------------|------------------|
| Hook in `shared/` | Breaks FSD; couples logic to React | Move to `entities/*/model` |
| Hook returns JSX | Violates logic/UI separation | Return data/callbacks only |
| Direct `fetch()` in hook | Bypasses security, caching, error handling | Wrap in Server Action or `shared/lib/graphql` |
| Import from another `feature/` | Creates tight coupling | Extract to `entities/` or `shared/lib/` |
| Logic in `widgets/` or `pages/` | Violates FSD composition rules | Delegate to `features/model` |
| `'use client'` without interactivity | Unnecessary hydration cost | Use Server Component instead |

---

## 7. 🧩 Composition & Reuse

- **Reuse logic** via:
  - Pure functions in `shared/lib/` (e.g., `debounce`, `slugify`)
  - Entity-level hooks in `entities/{name}/model/`
- **Avoid duplication**: If two features need the same logic, it likely belongs in an `entity`.

---

## 8. 🤖 Instructions for AI Assistants (CursorAI, Copilot, etc.)

When generating a hook, **always**:

1. **Ask**: “Is this for a **feature** (user action) or an **entity** (data model)?”
2. **Place**:
   - Feature → `features/{name}/model/use{Name}{Action}.ts`
   - Entity → `entities/{name}/model/use{Name}Query.ts` or `use{Name}Actions.ts`
3. **Use `'use client'`** only if the hook uses `useState`, `useEffect`, or Client Context.
4. **For mutations**: Call a **Server Action** — never raw endpoints.
5. **For Admin data**: Use **React Query** with proper query keys and cache invalidation.
6. **Return a typed object** with: `data?`, `isLoading`, `error`, and callbacks.
7. **Validate**: Could this be a Server Component? If yes — **don’t create a hook**.

> 💡 **Prompt Example**:  
> _“Generate a React hook `usePostPublish` in `features/admin-post/model` that calls a Server Action, uses React Query for cache invalidation, and returns typed loading/error states.”_

---

## 9. 📚 References

- [Feature-Sliced Design](https://feature-sliced.design/)
- [Atomic Design](https://atomicdesign.bradfrost.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Query Docs](https://tanstack.com/query)
- [Zod Validation](https://zod.dev/)
- Project: **Architectural Design Document v2.0**
- Project: **Project Architecture Guidelines (FSD + Atomic Design)**

---

> ✅ **This document is the single source of truth for React hooks** in “Behold Your God.”  
> Adherence ensures **architectural integrity**, **developer velocity**, and a **God-honoring user experience**.

--- 
