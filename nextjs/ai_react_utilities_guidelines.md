# 🧰 React Utility Functions Guidelines (Hybrid v1.0)

**For Pure, Reusable, and Architecture-Compliant Logic in Next.js (v15.5+)**  
*Aligned with Feature-Sliced Design + Atomic Design Principles*

> **Purpose**: This document defines how to write **React utility functions** (not hooks!) that are pure, type-safe, reusable, and fully compliant with the project’s architectural constraints. It is intended for developers and AI assistants (e.g., CursorAI) to generate consistent, layer-aware logic for the “Behold Your God” project.

---

## 1. 🎯 What Is a Utility Function?

A **utility function** is a **pure, stateless, side-effect-free function** that:
- Performs a single, well-defined transformation or computation.
- Accepts input and returns output—nothing more.
- Contains **no React dependencies** (`useState`, `useEffect`, etc.).
- Works identically in **Server Components**, **Client Components**, Node.js, and browsers .

> ✅ Examples: `formatDate()`, `slugify()`, `truncateText()`, `isEmail()`, `cn()`, `formatBibleRef()`  
> ❌ Not utilities: data fetchers, event handlers, state managers, or anything with `use*`.

---

## 2. 🏗️ Placement Rules (FSD Compliance)

Utility functions **must** be placed according to scope and reuse level, following strict FSD layering :

| Scope | Location | Rule |
|------|--------|------|
| **Global, framework-agnostic logic** | `src/shared/lib/` | ✅ Allowed everywhere; must not import from `entities`, `features`, `widgets`, or `pages` |
| **Domain-specific logic** (e.g., `formatPostExcerpt`, `validateCategorySlug`) | `src/entities/{domain}/model/` | ✅ Only if tightly coupled to a business entity (Post, TopicPage) and **not reused globally** |
| **Feature-specific helpers** (e.g., `buildAdminUploadConfig`) | `src/features/{name}/model/` | ✅ Only if used **exclusively** within that feature |

> ⚠️ **Never** place utilities in `ui/`, `pages/`, or outside the `lib/` or `model/` directories.

---

## 3. 🧪 Core Principles

### 3.1 Purity & Immutability
- Must be **pure functions**: same input → same output, no side effects .
- Must **not mutate** input data; always return new values (e.g., via spread operator).
- Must avoid `console.log`, `localStorage`, `fetch`, `Math.random()`, or `Date.now()` unless wrapped in a controlled context (e.g., `getCurrentDate()` is acceptable if documented).

### 3.2 TypeScript-First
- All parameters and return types **must be explicitly typed** using `interface` or `type`; avoid `any` .
- Leverage generics and TypeScript utility types (`Partial`, `Pick`) for flexible yet strict typing.
- Use `as const` for literal types to enable precise inference.

### 3.3 Single Responsibility
- One function = one job .

### 3.4 Arrow Functions
- **Arrow Functions**: All utility functions MUST use arrow function syntax for consistency and modern JavaScript practices.
- Keep logic concise (<50 lines preferred). Use guard clauses for early returns on invalid inputs.

### 3.4 Universal Runtime Compatibility
- Must work in **both server and client environments**.
- For client-only logic (e.g., `copyToClipboard`), guard with `typeof window !== 'undefined'` and **document the limitation**.

### 3.5 Performance & Tree-Shaking
- **Always** use **named exports** (`export const myUtil = ...`) to enable effective tree-shaking and reduce bundle size [[31], [33]].
- Avoid heavy computations; prefer lightweight, well-tested libraries.

---

## 4. 🔐 Security, Safety & Project Alignment

### 4.1 Security
- **Never** return raw HTML strings from utilities unless explicitly named (e.g., `unsafeHtml()` — discouraged).
- Sanitize or escape user-provided strings if used in contexts like URLs or attributes.
- Avoid regexes that are vulnerable to ReDoS; prefer well-tested libraries (`validator`) or validate patterns with `safe-regex` .

### 4.2 Validation & Data Integrity
- **Utilize Zod** within **model utilities** (`entities/*/model/`) for schema validation of AppSync mutation payloads, ensuring server-side data integrity [[22], [24]].
- Example: Define `PostSchema` in `entities/post/model/schema.ts` and use it to validate inputs before saving to DynamoDB.

### 4.3 Project-Specific Concerns
- Support **WCAG 2.1 AA** by designing text/media utilities that facilitate accessibility (e.g., alt-text generation, contrast-safe truncation) [[57], [66]].
- Handle **project entities**: Post, Category, TopicPage, MediaAsset. Utilities should understand slugs, doctrinal tags, and content formats (Article, Video, Podcast).
- Encapsulate **AWS AppSync** and **S3 presigned URL** logic within `entities/mediaasset/model/` utilities .

---

## 5. 📦 Naming, Documentation & Structure

- Use **clear, imperative names**: `formatDate`, not `dateFmtr`.
- Export only via **named exports** (no `export default`).
- Include comprehensive **JSDoc** for every function :
  ```ts
  /**
   * Truncates post excerpt for previews in the library.
   * @param excerpt - Original text from Post entity.
   * @param maxLength - Desired length (default: 150).
   * @returns Truncated string with ellipsis.
   * @example truncateExcerpt('Long biblical insight...', 20) // 'Long biblical...'
   */
  export const truncateExcerpt = (excerpt: string, maxLength: number = 150): string => { ... };
  ```
- Organize `shared/lib/` into thematic files (e.g., `text.ts`, `date.ts`, `validation.ts`).

---

## 6. 🧱 Layer Isolation (FSD Enforcement)

Utilities in `shared/lib/` **must obey strict dependency rules** to preserve unidirectional flow :

| Allowed Imports | Forbidden Imports |
|-----------------|-------------------|
| Other files in `shared/lib/` | `entities/` |
| External packages (`clsx`, `date-fns`, `zod`) | `features/` |
| `shared/config/` (constants only) | `widgets/` |
| | `pages/` |

> 🔒 Violations break architecture integrity and must be blocked by ESLint (`@feature-sliced/eslint-config`).

---

## 7. 🤖 Instructions for AI Assistants (e.g., CursorAI)

When generating a utility function:

1. **Placement**: Identify the correct layer:
   - Generic logic → `shared/lib/`
   - Domain logic (Post, TopicPage) → `entities/{x}/model/`
   - Feature logic (Admin upload) → `features/{x}/model/`

2. **Purity & Safety**:
   - Ensure functions are **pure** and import nothing from higher layers.
   - Never include `'use client'`, React imports, or async logic (unless it’s a pure transformation).

3. **Typing & Docs**:
   - Use **explicit TypeScript types** for all inputs and outputs.
   - Write full **JSDoc** with params, returns, and examples.

4. **Project Context**:
   - Reference project entities and AWS stack (AppSync, S3) when relevant.
   - Assume **server-first** execution unless the utility is explicitly client-only.

> 💡 **Prompt example**:  
> _“Generate a pure TypeScript utility to format a Bible reference (e.g., 'John 3:16') and place it in `src/shared/lib/text.ts`, following FSD guidelines and including JSDoc.”_

---

## 8. 📚 References

- [Feature-Sliced Design Official](https://feature-sliced.design/) 
- [Atomic Design – Brad Frost](https://atomicdesign.bradfrost.com/)
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Zod Documentation](https://zod.dev/) 
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/) 
- TypeScript Best Practices for Pure Functions 

> ✅ **This document is binding**. All utility code—handwritten or AI-generated—must comply.  
> 🔄 **Living document**: update as patterns evolve.