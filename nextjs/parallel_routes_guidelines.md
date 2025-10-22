# 📘 Master Guideline: URL-Driven UI with Parallel & Intercepting Routes in Next.js

> **Version**: 1.0  
> **Target Audience**: Frontend developers, architects, tech leads  
> **Framework**: Next.js (App Router, v13+)  
> **Status**: Recommended for production use

---

## 🔍 What is this pattern?

**URL-Driven UI** is an architectural pattern where **the state of the user interface is completely determined by the URL**. In Next.js, it's implemented through a combination of:

- **Parallel Routes** (`@slot`) — for declarative description of independent UI parts
- **Intercepting Routes** (`(..)route`) — for intercepting transitions and displaying content "over" the current page

**Result:**  
✅ Direct links to any UI state  
✅ Full browser history support (back/forward)  
✅ Context preservation on page refresh  
✅ SSR compatibility and no hydration errors

---

## 🧩 When to apply?

Use this pattern **if at least one** of the following conditions is met:

| Condition | Example |
|-----------|---------|
| UI state should persist on page refresh | Edit modal stays open after F5 |
| Direct links to state are required | `yoursite.com/tasks/123/edit` — colleague can open |
| Need to avoid context loss during interaction | User edits task without leaving list |
| Browser history integration required | Closing modal = pressing "Back" |
| UI consists of main content + secondary layer | Dashboard + settings, List + details |

> ⚠️ **Don't use** if state is temporary, insignificant, or shouldn't persist (e.g., hover, temporary notifications).

---

## 📦 Component architecture

For each modal/secondary state, create:

```
feature/
├── page.tsx                 ← main content
├── layout.tsx               ← connects @modal slot
├── @modal/                  ← parallel route (slot)
│   ├── default.tsx          ← fallback (usually null)
│   └── [state]/             ← e.g.: edit, delete, preview
│       └── page.tsx         ← secondary state UI
└── (..)[state]/             ← intercepting route
    └── page.tsx             ← intercepts /feature/[state]
```

### Mandatory rules:

1. **`(..)[state]/page.tsx` and `@modal/[state]/page.tsx` must render the same component**  
   → Use shared component from `components/`

2. **All UI components go in `components/`**  
   → Avoid logic duplication

3. **Layout must accept `modal` prop and pass it to provider**  
   → Provider manages display (overlay, positioning)

4. **Closing = `router.push('/feature')`**  
   → Don't use `router.back()` — this breaks history

---

## 🛠 Implementation template

### 1. Shared component (UI)

```tsx
// components/EditTaskModal.tsx
'use client';
export default function EditTaskModal() { /* ... */ }
```

### 2. Parallel Route (slot)

```tsx
// app/tasks/@modal/edit/page.tsx
import EditTaskModal from '@/components/EditTaskModal';
export default function ModalEdit() {
  return <EditTaskModal />;
}
```

### 3. Intercepting Route (intercept)

```tsx
// app/tasks/(..)edit/page.tsx
import EditTaskModal from '@/components/EditTaskModal';
export default function InterceptedEdit() {
  return <EditTaskModal />;
}
```

### 4. Layout

```tsx
// app/tasks/layout.tsx
import { ModalProvider } from './ModalProvider';

export default function TasksLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return <ModalProvider modal={modal}>{children}</ModalProvider>;
}
```

### 5. Modal provider

```tsx
// app/tasks/ModalProvider.tsx
'use client';
export function ModalProvider({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  const router = useRouter();
  
  if (modal) {
    return (
      <>
        {children}
        <div onClick={() => router.push('/tasks')}>{modal}</div>
      </>
    );
  }
  return <>{children}</>;
}
```

---

## ✅ Use cases list

Below are **standard business scenarios** where the pattern is **optimal**:

| # | Case | Example URL | Why it fits |
|---|------|-------------|-------------|
| 1 | **Entity editing** | `/tasks/123/edit` | Context preservation, direct link to editing |
| 2 | **Detail viewing** | `/orders/456` | Details over list, no filter/sort loss |
| 3 | **Multi-step forms** | `/checkout?step=payment` | Form progress in URL, refresh support |
| 4 | **Action confirmation** | `/users/101/delete` | List context + safe confirmation |
| 5 | **Object comparison** | `/products/compare?ids=1,2` | Comparison state persists and shareable |
| 6 | **Embedded chats/comments** | `/docs/789?chat=open` | Chat as part of document context |
| 7 | **Media viewing** | `/gallery?media=photo-42.jpg` | Lightbox with history and SEO support |
| 8 | **Settings/preferences** | `/settings/profile?modal=theme` | Settings over dashboard without navigation |
| 9 | **Integrations (OAuth, SSO)** | `/settings/calendar?connect=google` | Integration result in settings context |
| 10 | **Filtering with persistence** | `/analytics?modal=save-filter` | Filters + modal = single snapshot |

---

## ⚠️ Anti-patterns and errors

| Error | Consequence | How to avoid |
|-------|-------------|--------------|
| Different components in `(..)edit` and `@modal/edit` | UI inconsistency on refresh vs navigation | Use one shared component |
| Missing `default.tsx` | Errors when slot is inactive | Always create `@modal/default.tsx` → `return null` |
| Closing via `router.back()` | Breaks history (user goes to wrong place) | Always return to **specific URL** (`/feature`) |
| Storing state in `useState` instead of URL | State lost on refresh | Make URL **source of truth** |
| Using in Pages Router | Doesn't work | Requires **App Router** |

---

## 📈 Business benefits

- **Increased conversion**: users don't lose context during interaction
- **Better UX**: predictable behavior, back-button support
- **Reduced support**: direct links simplify problem diagnosis
- **SEO-friendly**: main content indexed, modals optional
- **Testability**: each state is separate URL → easy to write e2e tests

---

## 📚 Useful resources

- [Official documentation: Parallel Routes](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes)
- [Official documentation: Intercepting Routes](https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes)
- [Vercel example: URL-Driven Modals](https://github.com/vercel/next.js/tree/canary/examples/url-driven-modals)

---

> 💡 **Remember**:  
> **URL is not just an address. It's a complete snapshot of your application state.**  
> If a user can refresh the page and see the same thing — you did everything right.

---

**Author**: Full Stack Software Developer & Mentor  
**Date**: October 16, 2025  
**License**: MIT (freely use in your projects and documentation)