# 📜 Unified Server Actions Guidelines  
**For AI Assistants (e.g., CursorAI)**  
*Next.js App Router v15.5+ • TypeScript • FSD + Atomic Design • AWS Amplify Backend*  
> **Purpose**: This document provides precise, actionable, and technically complete instructions for AI coding assistants to generate **secure, maintainable, and architecturally compliant Server Actions** in the “Behold Your God” project. It unifies the **technical depth of GR1** (AWS integration, security, caching, testing) with the **formal clarity and AI-optimized structure of QN3**, while adhering strictly to the Architectural Design Document (ADD) and Project Architecture Guidelines (PAG).

---

## 1. 🎯 Core Principles

Server Actions are **server-only functions** that encapsulate data mutations, business logic, and side effects. They are the **primary mechanism for user-initiated writes** (create, update, delete, publish) in this project.

### Key Tenets:
- **Security-first**: All inputs are untrusted. Validate with Zod, sanitize rich text, enforce RBAC via Cognito.
- **Layered architecture**: Actions belong **only** to `entities/{name}/model/` (domain CRUD) or `features/{name}/model/` (user workflows).
- **Type safety**: End-to-end typing via Zod schemas (`z.infer`) and explicit return contracts.
- **AWS alignment**: Mutations use **AppSync GraphQL** via Amplify SDK; file uploads use **S3 presigned URLs**.
- **Performance**: Use `revalidatePath`/`revalidateTag` for ISR; avoid client-side data fetching in mutations.
- **AI-ready**: Structured, predictable patterns for reliable code generation.

> ✅ Server Actions in Next.js 15 provide automatic CSRF protection and unguessable endpoints—**but validation, auth, and error handling remain your responsibility**.

---

## 2. 📁 Placement Rules (FSD Compliance)

### ✅ Allowed Locations
| Use Case | Path |
|--------|------|
| **Entity-level mutations** (e.g., create a `Post`) | `src/entities/post/model/createPostAction.ts` |
| **Feature-level workflows** (e.g., `publishDraftWithNotification`) | `src/features/admin-publish/model/publishPostAction.ts` |

### ❌ Forbidden Locations
- `shared/` — no business logic allowed.
- `widgets/` — composition-only layer.
- `pages/` — pages delegate, not implement.
- Any file outside a `model/` subdirectory.

> 🔗 Dependencies must flow **downward only**:  
> `features` → `entities` → `shared`  
> Never import upward (e.g., `entities` must not import from `features`).

---

## 3. 🧪 Input Validation & Sanitization

### 3.1 Zod Schema (Mandatory)
Every Server Action **must** validate input using a colocated Zod schema.

```ts
// src/entities/post/model/createPostSchema.ts
import { z } from 'zod';

export const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  categories: z.array(z.string().uuid()).min(1),
  format: z.enum(['Article', 'Video', 'Podcast']),
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;
```

### 3.2 Sanitization (For Rich Text)
If the input contains HTML (e.g., `Post.content`), sanitize **before persistence**:

```ts
import DOMPurify from 'isomorphic-dompurify';
const sanitizedContent = DOMPurify.sanitize(validated.content);
```

> ⚠️ Never store or render unsanitized user input.

---

## 4. 🔐 Security Requirements

Every Server Action **must** implement:

### 4.1 `'use server'` Directive
```ts
'use server';
```

### 4.2 Authentication & RBAC
Use Cognito session to verify identity and role:

```ts
// shared/lib/auth.ts
import { Auth } from 'aws-amplify';

export async function getCurrentUser() {
  try {
    const user = await Auth.currentAuthenticatedUser();
    const groups = user.signInUserSession?.accessToken?.payload['cognito:groups'] || [];
    const role = groups.includes('Admins') ? 'Admin' : groups.includes('Editors') ? 'Editor' : 'Moderator';
    return { id: user.attributes.sub, role };
  } catch {
    return null;
  }
}
```

In action:
```ts
const currentUser = await getCurrentUser();
if (!currentUser || !['Admin', 'Editor'].includes(currentUser.role)) {
  return { success: false, error: 'Unauthorized' } as const;
}
```

### 4.3 Error Handling
- **Never throw** if consumed by `useFormState`.
- **Never expose raw errors** to the client.
- Log to CloudWatch for debugging.

---

## 5. 🔄 Return Contract (Discriminated Union)

All Server Actions **must** return:

```ts
{ success: true; data?: T } | { success: false; error: string }
```

Use `as const` for type narrowing:

```ts
return { success: true } as const;
return { success: false, error: 'Validation failed' } as const;
```

> ✅ This enables safe consumption in `useFormState`, React Query, or manual handlers.

---

## 6. ⚡ AWS Integration Patterns

### 6.1 AppSync Mutation (GraphQL)
Use Amplify’s `API.graphql`:

```ts
import { API } from 'aws-amplify';
import { createPost as createPostGql } from '@/graphql/mutations';

const result = await API.graphql({
  query: createPostGql,
  variables: { input: { ...sanitizedData, authorId: currentUser.id } },
}) as { data: { createPost: Post } };
```

### 6.2 S3 File Uploads
1. Generate presigned URL in Server Action.
2. Client uploads directly to S3.
3. Save metadata via separate mutation.

```ts
// In upload action
const { url } = await API.graphql({ query: getPresignedUrl, variables: { ... } });
return { success: true, url };
```

---

## 7. 🧹 Caching & Revalidation

After **any successful mutation** that affects public content:

```ts
import { revalidatePath, revalidateTag } from 'next/cache';

revalidatePath('/library');
revalidatePath(`/post/${slug}`);
revalidateTag('posts-by-category');
```

> 🌐 This ensures SSG pages reflect the latest data without full rebuilds.

---

## 8. 🧩 Client Integration

### 8.1 Public Pages (Simple Forms)
Use React’s built-in hooks:

```tsx
'use client';
import { useFormState } from 'react-dom';
import { createPostAction } from '@/entities/post/model/createPostAction';

function PostForm() {
  const [state, formAction] = useFormState(createPostAction, { success: false });
  return (
    <form action={formAction}>
      {/* inputs */}
      {state.success === false && <p>{state.error}</p>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 8.2 Admin Panel (Advanced State)
Use **React Query** for optimistic updates and cache management:

```ts
const mutation = useMutation({
  mutationFn: publishPostAction,
  onSuccess: (result) => {
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    }
  }
});
```

---

## 9. 🧪 Testing & Observability

### 9.1 Unit Tests *(Post-MVP)*
**MVP Approach**: Manual testing + TypeScript + Zod validation

**Post-MVP**: Mock Amplify and Cognito with Vitest:
```ts
vi.mock('aws-amplify');
vi.mock('@/shared/lib/auth', () => ({
  getCurrentUser: () => Promise.resolve({ id: '1', role: 'Editor' })
}));
```

### 9.2 Monitoring
- Log errors to **CloudWatch**.
- Set alarms on `AppSync` error rates.
- Use structured logging: `console.error('CREATE_POST_ERROR', { userId, postId })`.

---

## 10. 🤖 Instructions for AI Assistants

When generating a Server Action:

1. **Identify layer**:  
   - Domain CRUD → `entities/{name}/model/`  
   - User workflow → `features/{name}/model/`
2. **Create Zod schema** in the same directory.
3. **Name action** with verb: `createX`, `publishY`, `deleteZ`.
4. **Include**:  
   - `'use server'`  
   - Zod `.safeParse()`  
   - Cognito RBAC check  
   - AppSync/S3 integration  
   - `revalidatePath`/`revalidateTag`  
   - Structured return (`as const`)
5. **Never**:  
   - Import from `widgets` or `pages`  
   - Use `parse()` instead of `safeParse()`  
   - Expose raw errors  
   - Skip sanitization for HTML

> 💡 **Prompt example**:  
> _“Generate a Server Action to create a Post in Next.js 15.5 using FSD, Zod, AppSync, Cognito RBAC, and DOMPurify. Place it in `entities/post/model/`.”_

---

## 11. 📚 References

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [AWS Amplify GraphQL](https://docs.amplify.aws/)
- [Zod Validation](https://zod.dev/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Atomic Design](https://atomicdesign.bradfrost.com/)
- [DOMPurify (isomorphic)](https://github.com/cure53/DOMPurify)

---

> ✅ **This document is the single source of truth for Server Actions in “Behold Your God.”**  
> 🔁 Update it as the project evolves. Enforce via ESLint, code reviews, and AI context injection.