# 📘 Unified TypeScript Types & Interfaces Guidelines  
**For AI Assistants (e.g., CursorAI)**  
*Next.js App Router v15.5+ · Feature-Sliced Design + Atomic Design · Zod-First Validation · God-Centered Domain*

> **Purpose**: This document defines precise, actionable, and AI-friendly rules for generating **TypeScript types and interfaces** in the “Behold Your God” project. It merges the **strict architectural discipline of QN3** with the **domain-aware patterns and accessibility considerations of GR1/GE2**, ensuring generated code is type-safe, layer-compliant, Zod-validated, and aligned with both **AWS Amplify/AppSync** infrastructure and **WCAG** standards.

---

## 1. 🎯 Core Principles

### 1.1. Type-Driven Development
- All public contracts **must** be explicitly typed: component props, Server Action inputs/outputs, API payloads, domain models.
- **Never** use `any` or unvalidated `unknown`. Prefer `z.infer<typeof schema>` over hand-written types for data crossing trust boundaries (user input, GraphQL, DynamoDB).
- Favor **immutability**: use `readonly`, `ReadonlyArray<T>`, and `as const` where appropriate.
- Reflect the **God-centered domain**: use enums or discriminated unions for doctrinal concepts (e.g., `doctrinalTag: 'Holiness' | 'Sovereignty'`).

### 1.2. Single Source of Truth via Zod
- **Define Zod schemas first** for all external or user-provided data (forms, Server Actions, API responses).
- Derive TypeScript types using `z.infer<typeof MySchema>` — **do not duplicate structure**.
- Place schemas in the same layer as their usage:
  - `entities/post/model/post.schema.ts`
  - `features/create-post/model/createPost.schema.ts`

---

## 2. 🏗️ Layered Type Placement (FSD Rules)

Types **must** reside in the same architectural layer as the logic they support. Never leak types upward.

| Layer       | Type Location                              | Example Types                                  | Allowed Dependencies |
|-------------|--------------------------------------------|-----------------------------------------------|----------------------|
| `shared`    | `shared/lib/types.ts`                      | `ID`, `Timestamp`, `Nullable<T>`, `URLString`, `ButtonProps` | None (external libs only) |
| `entities`  | `entities/{name}/model/types.ts`           | `User`, `Post`, `Category`, `MediaAsset` (domain models) | `shared` only |
| `features`  | `features/{name}/model/types.ts`           | `LoginFormValues`, `PublishPostInput`, workflow states | `entities`, `shared` |
| `widgets`   | `widgets/{name}/ui/types.ts` (if needed)   | `HeaderProps`, `PostCardProps`                | `features`, `entities`, `shared` |
| `pages`     | **Avoid defining types here**              | Reuse from lower layers                       | All lower layers |

> ✅ **Rule**: If a type is used in multiple layers, it belongs in the **lowest common denominator** (usually `entities` or `shared`).  
> ⚠️ **Enforcement**: AI must never generate `import { X } from 'pages/...'` in lower layers.

---

## 3. 🧱 Atomic Design & UI Component Types

All UI components in `shared/ui` and `widgets` must have **explicit, well-named prop interfaces**.

### 3.1. Naming & Structure
- Use `PascalCase` + `Props` suffix: `ButtonProps`, `UserAvatarProps`.
- Include **WCAG-compliant props** where relevant: `ariaLabel?: string`, `ariaDescribedBy?: string`.

```ts
// shared/ui/atoms/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  ariaLabel?: string; // WCAG 2.1 AA
  children: React.ReactNode;
  onClick?: () => void;
}
```

### 3.2. Rules
- **No business logic in props** — only presentation and interaction callbacks.
- **Prefer union types over enums** for variants (e.g., `'primary' | 'secondary'`).
- **All props must be typed** — no implicit `any`.
- **Atoms**: minimal, stateless props.  
- **Organisms/Widgets**: composed generics or discriminated unions if needed.

---

## 4. ⚙️ Server Actions, Data Flow & Validation

### 4.1. Input Types (Zod-First)
```ts
// features/post/model/createPost.schema.ts
export const CreatePostSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  format: z.enum(['Article', 'Video', 'Podcast']),
  categoryId: z.string().uuid(),
  doctrinalTag: z.enum(['Holiness', 'Sovereignty']).optional(),
});
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
```

### 4.2. Output Types (Discriminated Unions)
```ts
type CreatePostResult =
  | { success: true; post: PostEntity }
  | { success: false; error: { message: string; code?: string } };
```

### 4.3. Domain Models (entities)
```ts
// entities/post/model/types.ts
/** @layer entities Describes a biblical post entity from DynamoDB. */
export interface PostEntity {
  readonly id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string; // RichText (assume unsanitized)
  format: 'Article' | 'Video' | 'Podcast';
  publishedAt?: Date;
  authorId: string;
  categories: readonly string[]; // slugs
  tags: readonly string[];
  coverImageS3Url?: string;
  doctrinalTag?: 'Holiness' | 'Sovereignty';
}
```

> ✅ Use **discriminated unions** for format-specific fields if needed (e.g., `VideoPost` with `duration`).

---

## 5. 🔗 Cross-Layer Type Sharing

- **Public APIs only**: each module exports via `index.ts`:
  ```ts
  // entities/post/index.ts
  export type { PostEntity } from './model/types';
  export { PostSchema } from './model/post.schema';
  ```
- **Never import from higher layers**.
- Use **barrel files** to control visibility.

---

## 6. 🛡️ Security, Accessibility & Best Practices

- **Validate all external data** — even from DynamoDB (trust but verify).
- **Sanitize before rendering**: if a type includes HTML (e.g., `content: string`), treat as unsafe.
- **Never expose internal fields** (e.g., `passwordHash`, `cognitoSub`).
- **Enable strict TypeScript**: `strict: true`, `strictNullChecks`, `noImplicitAny`.
- **Prefer `interface` for props and DTOs** (mergeable); `type` for unions, mapped types.
- **Use type guards** for narrowing:
  ```ts
  function isPublished(post: PostEntity): post is PostEntity & { publishedAt: Date } {
    return !!post.publishedAt;
  }
  ```

---

## 7. 🤖 AI Assistant Instructions (CursorAI)

When generating TypeScript types:

1. **Identify the architectural layer** (entities vs features vs widgets).
2. **Prefer Zod schemas** for any data crossing a boundary.
3. **Place types in `model/` directories** of the relevant slice.
4. **Use `interface` for object-shaped contracts**; `type` for unions.
5. **Never generate types in `pages/`** — delegate downward.
6. **Name clearly**: `PostPreview` vs `PostFull`; `LoginFormValues` vs `AuthCredentials`.
7. **Add JSDoc with `@layer`** for traceability.
8. **Include ARIA props** in UI components when interactive.
9. **Output full files** with correct imports and exports.

> 💡 **Prompt Example**:  
> _"Generate a discriminated union for MediaAsset (image/audio/video) in entities/media, with Zod schema and WCAG-aware props for a Next.js App Router component."_

---

## 8. 📚 References

- [Next.js App Router](https://nextjs.org/docs/app)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Atomic Design (Brad Frost)](https://atomicdesign.bradfrost.com/)
- [Zod Validation](https://zod.dev/)
- AWS Amplify + AppSync + DynamoDB Schema Best Practices
- WCAG 2.1 AA Guidelines for Interactive Components

> ✅ **This document is authoritative and living**. Update as the project evolves.

---
