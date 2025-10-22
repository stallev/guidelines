# 🚀 Comprehensive Next.js Development Guidelines
## Complete Guide for AI Agents and Developers

**Version:** 1.0  
**Date:** January 16, 2025  
**Status:** Production Ready  
**Target:** AI Assistants (CursorAI), Developers, Architects

> **Purpose**: This is your **complete Next.js development compass**. A unified source of truth that combines all architectural principles, patterns, and best practices for building scalable, performant, and maintainable Next.js applications.

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start) — 5-minute overview
2. [Architecture Overview](#-architecture-overview) — Core principles and structure
3. [Technology Stack](#-technology-stack) — What we use and why
4. [Component Development](#-component-development) — React components and patterns
5. [Routing & Navigation](#-routing--navigation) — App Router patterns and URL-driven UI
6. [Data Management](#-data-management) — Server Actions, API routes, and state
7. [Performance Optimization](#-performance-optimization) — Speed and efficiency
8. [TypeScript Integration](#-typescript-integration) — Type safety and patterns
9. [Testing Strategies](#-testing-strategies) — Quality assurance
10. [Deployment & DevOps](#-deployment--devops) — Production readiness
11. [AI Agent Guidelines](#-ai-agent-guidelines) — Specific instructions for AI assistants

---

## 🚀 Quick Start

### For AI Agents: Start Here

**When building a Next.js application, follow this decision tree:**

1. **What are you building?**
   - **Page/Route** → Use App Router with `page.tsx`
   - **Component** → Follow FSD + Atomic Design structure
   - **Data mutation** → Use Server Actions
   - **UI state** → Consider URL-driven patterns

2. **Where does it belong?**
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

### Essential Commands

```bash
# Create new Next.js project
npx create-next-app@latest my-app --typescript --tailwind --eslint --app

# Add required dependencies
npm install zod @hookform/resolvers react-hook-form
npm install -D @types/node

# Run development server
npm run dev
```

---

## 🏗️ Architecture Overview

### Core Principles

1. **Feature-Sliced Design (FSD) 2.1**: Governs project structure and dependency rules
2. **Atomic Design**: Manages UI component hierarchy within `shared/ui`
3. **Server-First Approach**: Default to Server Components, use Client Components only when necessary
4. **Type Safety**: End-to-end TypeScript with Zod validation
5. **Performance First**: Optimize for Core Web Vitals and user experience

### FSD Layer Structure

```
src/
├── shared/           ← Global, framework-agnostic code
│   ├── ui/           ← Atomic components (Atoms, Molecules)
│   ├── lib/          ← Utilities and helpers
│   └── config/       ← Global constants
├── entities/         ← Domain models (User, Post, Category)
│   ├── model/        ← Types, schemas, Server Actions
│   └── ui/           ← Entity-specific UI (rare)
├── features/         ← User actions (Login, Publish)
│   ├── ui/           ← Action components
│   └── model/        ← Hooks, validation
├── widgets/          ← Complex UI blocks (Header, PostCard)
│   └── ui/           ← Composer components
└── pages/            ← Next.js routes (App Router)
    ├── page.tsx      ← Route components
    ├── loading.tsx   ← Loading states
    └── error.tsx      ← Error boundaries
```

### Dependency Rules

- ✅ **Downward only**: Each layer can import from layers below
- ❌ **No upward imports**: `shared` cannot import from `entities`/`features`/`widgets`/`pages`
- ❌ **No cross-layer imports**: `features` cannot import from other `features`

---

## 🛠️ Technology Stack

### Core Framework
- **Next.js 15+** (App Router)
- **React 18+** (Server Components, Concurrent Features)
- **TypeScript 5+** (Strict mode)

### UI & Styling
- **Tailwind CSS** (Utility-first styling)
- **shadcn/ui** (Component library)
- **Radix UI** (Headless components)
- **Framer Motion** (Animations)

### Data & State
- **Zod** (Schema validation)
- **React Hook Form** (Form management)
- **TanStack Query** (Server state)
- **Zustand** (Client state)

### Backend & Database
- **AWS Amplify** (Backend-as-a-Service)
- **AppSync GraphQL** (API layer)
- **DynamoDB** (Database)
- **S3** (File storage)

### Development Tools
- **ESLint** (Code linting)
- **Prettier** (Code formatting)
- **Husky** (Git hooks)
- **Jest** (Testing)

---

## 🧩 Component Development

### Server Components (Default)

**Use Server Components by default** - they're faster, more secure, and SEO-friendly.

```tsx
// ✅ Server Component (default)
import { getUser } from '@/entities/user/model/getUser';

export default async function UserProfile({ userId }: { userId: string }) {
  const user = await getUser(userId);
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### Client Components (When Needed)

**Only use Client Components when you need:**
- Browser APIs (localStorage, geolocation)
- Event handlers (onClick, onChange)
- State management (useState, useEffect)
- Third-party libraries that require client-side rendering

```tsx
// ✅ Client Component (when needed)
'use client';

import { useState } from 'react';

export const Counter = () => {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
};
```

### Atomic Design Structure

#### Atoms (Basic UI Elements)
```tsx
// shared/ui/atoms/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button = ({ variant = 'primary', size = 'md', children, onClick }: ButtonProps) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
          'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
        },
        {
          'h-9 px-3 text-sm': size === 'sm',
          'h-10 px-4 py-2': size === 'md',
          'h-11 px-8 text-lg': size === 'lg',
        }
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

#### Molecules (Composed Atoms)
```tsx
// shared/ui/molecules/SearchField.tsx
import { Input } from '@/shared/ui/atoms/Input';
import { Button } from '@/shared/ui/atoms/Button';

interface SearchFieldProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

export const SearchField = ({ placeholder = 'Search...', onSearch }: SearchFieldProps) => {
  const [query, setQuery] = useState('');
  
  return (
    <div className="flex gap-2">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
      />
      <Button onClick={() => onSearch(query)}>
        Search
      </Button>
    </div>
  );
};
```

### Component Patterns

#### Compound Components
```tsx
// shared/ui/molecules/Card.tsx
const Card = ({ children, className, ...props }: CardProps) => (
  <div className={cn('rounded-lg border bg-card', className)} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className, ...props }: CardHeaderProps) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className, ...props }: CardTitleProps) => (
  <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props}>
    {children}
  </h3>
);

Card.Header = CardHeader;
Card.Title = CardTitle;

export { Card };
```

#### Render Props Pattern
```tsx
// shared/ui/molecules/DataFetcher.tsx
interface DataFetcherProps<T> {
  children: (data: T | null, loading: boolean, error: Error | null) => React.ReactNode;
  fetchFn: () => Promise<T>;
}

export const DataFetcher = <T,>({ children, fetchFn }: DataFetcherProps<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    fetchFn()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [fetchFn]);
  
  return <>{children(data, loading, error)}</>;
};
```

---

## 🛣️ Routing & Navigation

### App Router Structure

```
app/
├── layout.tsx              ← Root layout
├── page.tsx                 ← Home page
├── loading.tsx              ← Global loading UI
├── error.tsx                ← Global error UI
├── not-found.tsx            ← 404 page
├── (auth)/                  ← Route group
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── dashboard/
│   ├── layout.tsx           ← Dashboard layout
│   ├── page.tsx
│   └── settings/
│       └── page.tsx
└── api/                     ← API routes
    └── users/
        └── route.ts
```

### URL-Driven UI Patterns

#### Parallel Routes
```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  modal
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        {children}
        {modal}
      </main>
    </div>
  );
}
```

#### Intercepting Routes
```tsx
// app/dashboard/@modal/edit/[id]/page.tsx
import { EditUserModal } from '@/features/user-edit/ui/EditUserModal';

export default function EditUserModalPage({ params }: { params: { id: string } }) {
  return <EditUserModal userId={params.id} />;
}

// app/dashboard/(..)edit/[id]/page.tsx
import { EditUserModal } from '@/features/user-edit/ui/EditUserModal';

export default function EditUserPage({ params }: { params: { id: string } }) {
  return <EditUserModal userId={params.id} />;
}
```

### Navigation Patterns

#### Programmatic Navigation
```tsx
'use client';

import { useRouter } from 'next/navigation';

export const NavigationButton = () => {
  const router = useRouter();
  
  const handleNavigation = () => {
    // Navigate to specific route
    router.push('/dashboard/settings');
    
    // Navigate with query parameters
    router.push('/search?q=nextjs&category=tutorials');
    
    // Navigate and replace history
    router.replace('/login');
    
    // Navigate back
    router.back();
  };
  
  return <button onClick={handleNavigation}>Navigate</button>;
};
```

#### Route Protection
```tsx
// app/dashboard/layout.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/entities/user/model/getCurrentUser';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return <>{children}</>;
}
```

---

## 📊 Data Management

### Server Actions

#### Entity-Level Actions
```tsx
// entities/post/model/createPostAction.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const CreatePostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
  categoryId: z.string().uuid(),
});

export const createPostAction = async (data: z.infer<typeof CreatePostSchema>) => {
  try {
    // Validate input
    const validatedData = CreatePostSchema.parse(data);
    
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized');
    }
    
    // Create post
    const post = await createPost({
      ...validatedData,
      authorId: user.id,
    });
    
    // Revalidate cache
    revalidatePath('/posts');
    
    return { success: true, post };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
```

#### Feature-Level Actions
```tsx
// features/publish-post/model/publishPostAction.ts
'use server';

export const publishPostAction = async (postId: string) => {
  try {
    const user = await getCurrentUser();
    if (!user?.isAdmin) {
      throw new Error('Insufficient permissions');
    }
    
    const post = await publishPost(postId);
    
    // Send notifications
    await sendNotificationToSubscribers(post);
    
    revalidatePath('/posts');
    revalidatePath('/admin');
    
    return { success: true, post };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Publish failed' 
    };
  }
};
```

### API Routes

#### RESTful API Routes
```tsx
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CreatePostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const posts = await getPosts();
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreatePostSchema.parse(body);
    
    const post = await createPost(validatedData);
    
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
```

### Client-Side Data Fetching

#### TanStack Query Setup
```tsx
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});
```

#### Custom Hooks
```tsx
// entities/post/model/usePostQuery.ts
import { useQuery } from '@tanstack/react-query';

export const usePostQuery = (postId: string) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPost(postId),
    enabled: !!postId,
  });
};

export const usePostsQuery = (filters?: PostFilters) => {
  return useQuery({
    queryKey: ['posts', filters],
    queryFn: () => getPosts(filters),
  });
};
```

---

## ⚡ Performance Optimization

### Core Web Vitals Targets

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTFB (Time to First Byte)**: < 600ms

### Rendering Strategies

#### Static Site Generation (SSG)
```tsx
// app/posts/[slug]/page.tsx
import { getPost, getPosts } from '@/entities/post/model/getPost';

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

#### Incremental Static Regeneration (ISR)
```tsx
// app/posts/page.tsx
import { getPosts } from '@/entities/post/model/getPosts';

export const revalidate = 3600; // Revalidate every hour

export default async function PostsPage() {
  const posts = await getPosts();
  
  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

#### Server-Side Rendering (SSR)
```tsx
// app/dashboard/page.tsx
import { getCurrentUser } from '@/entities/user/model/getCurrentUser';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

### Image Optimization

```tsx
import Image from 'next/image';

export const OptimizedImage = ({ src, alt, width, height }: ImageProps) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={false} // Only for above-the-fold images
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
};
```

### Code Splitting

#### Dynamic Imports
```tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const HeavyChart = dynamic(() => import('@/shared/ui/molecules/HeavyChart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false, // Disable SSR for client-only components
});

export const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <HeavyChart />
    </div>
  );
};
```

#### Route-Based Splitting
```tsx
// app/dashboard/analytics/page.tsx
import dynamic from 'next/dynamic';

const AnalyticsDashboard = dynamic(
  () => import('@/widgets/analytics-dashboard/ui/AnalyticsDashboard'),
  {
    loading: () => <div>Loading analytics...</div>,
  }
);

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
```

---

## 🔷 TypeScript Integration

### Type Safety Patterns

#### Zod Schema Validation
```tsx
// entities/user/model/user.schema.ts
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'editor', 'viewer']),
  createdAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;
```

#### API Response Types
```tsx
// shared/lib/api.types.ts
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}
```

#### Component Props
```tsx
// shared/ui/atoms/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  children, 
  onClick 
}: ButtonProps) => {
  return (
    <button
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
          'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
          'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
        },
        {
          'h-9 px-3 text-sm': size === 'sm',
          'h-10 px-4 py-2': size === 'md',
          'h-11 px-8 text-lg': size === 'lg',
        }
      )}
    >
      {loading && <Spinner className="mr-2" />}
      {children}
    </button>
  );
};
```

### Generic Types

#### Reusable Components
```tsx
// shared/ui/molecules/DataTable.tsx
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
}

export const DataTable = <T,>({ data, columns, onRowClick }: DataTableProps<T>) => {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>{column.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index} onClick={() => onRowClick?.(row)}>
            {columns.map((column) => (
              <td key={column.key}>
                {column.render ? column.render(row) : row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

---

## 🧪 Testing Strategies

### Unit Testing

#### Component Testing
```tsx
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/shared/ui/atoms/Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

#### Hook Testing
```tsx
// __tests__/hooks/usePostQuery.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePostQuery } from '@/entities/post/model/usePostQuery';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('usePostQuery', () => {
  it('fetches post data', async () => {
    const { result } = renderHook(() => usePostQuery('post-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      id: 'post-1',
      title: 'Test Post',
      content: 'Test content',
    });
  });
});
```

### Integration Testing

#### Server Action Testing
```tsx
// __tests__/actions/createPostAction.test.ts
import { createPostAction } from '@/entities/post/model/createPostAction';

describe('createPostAction', () => {
  it('creates a post successfully', async () => {
    const postData = {
      title: 'Test Post',
      content: 'Test content',
      categoryId: 'category-1',
    };

    const result = await createPostAction(postData);

    expect(result.success).toBe(true);
    expect(result.post).toMatchObject({
      title: postData.title,
      content: postData.content,
    });
  });

  it('validates input data', async () => {
    const invalidData = {
      title: '', // Empty title should fail
      content: 'Test content',
      categoryId: 'category-1',
    };

    const result = await createPostAction(invalidData);

    expect(result.success).toBe(false);
    expect(result.error).toContain('title');
  });
});
```

### E2E Testing

#### Playwright Setup
```tsx
// tests/e2e/post-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Post Creation', () => {
  test('should create a new post', async ({ page }) => {
    await page.goto('/dashboard/posts');
    
    await page.click('[data-testid="create-post-button"]');
    
    await page.fill('[data-testid="post-title"]', 'New Post');
    await page.fill('[data-testid="post-content"]', 'Post content');
    
    await page.click('[data-testid="save-post-button"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('text=New Post')).toBeVisible();
  });
});
```

---

## 🚀 Deployment & DevOps

### Environment Configuration

#### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

#### Configuration Files
```tsx
// lib/config.ts
export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'My App',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  database: {
    url: process.env.DATABASE_URL!,
  },
  auth: {
    secret: process.env.NEXTAUTH_SECRET!,
    url: process.env.NEXTAUTH_URL!,
  },
} as const;
```

### Build Optimization

#### Next.js Configuration
```tsx
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
};

module.exports = nextConfig;
```

#### Bundle Analysis
```bash
# Analyze bundle size
npm install -D @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

### CI/CD Pipeline

#### GitHub Actions
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: .next/
```

---

## 🤖 AI Agent Guidelines

### Code Generation Rules

#### Component Creation
```tsx
// ✅ AI Agent: When creating a component, follow this pattern:

// 1. Start with Server Component (default)
export default async function ComponentName({ params }: { params: { id: string } }) {
  // Server-side data fetching
  const data = await fetchData(params.id);
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}

// 2. Add 'use client' only when needed
'use client';

export const ClientComponent = () => {
  // Client-side logic
  return <div>Client Component</div>;
};
```

#### Server Action Creation
```tsx
// ✅ AI Agent: When creating Server Actions, follow this pattern:

'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// 1. Define Zod schema
const ActionSchema = z.object({
  // Define input validation
});

// 2. Create action function
export const actionName = async (data: z.infer<typeof ActionSchema>) => {
  try {
    // 1. Validate input
    const validatedData = ActionSchema.parse(data);
    
    // 2. Check authentication
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');
    
    // 3. Perform action
    const result = await performAction(validatedData);
    
    // 4. Revalidate cache
    revalidatePath('/path');
    
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Action failed' 
    };
  }
};
```

### File Structure Rules

#### FSD Compliance
```
src/
├── shared/ui/atoms/          ← Basic UI components
├── shared/ui/molecules/      ← Composed components
├── shared/lib/               ← Utilities
├── entities/{name}/model/    ← Domain logic
├── entities/{name}/ui/       ← Entity-specific UI
├── features/{name}/model/    ← Business logic
├── features/{name}/ui/       ← Feature components
├── widgets/{name}/ui/        ← Complex UI blocks
└── pages/                    ← Next.js routes
```

#### Import Rules
```tsx
// ✅ Correct imports (downward only)
import { Button } from '@/shared/ui/atoms/Button';
import { User } from '@/entities/user/model/User';
import { useAuth } from '@/features/auth/model/useAuth';

// ❌ Incorrect imports (upward)
import { Dashboard } from '@/pages/dashboard'; // shared cannot import from pages
import { UserCard } from '@/widgets/user-card'; // entities cannot import from widgets
```

### Performance Optimization Rules

#### Image Optimization
```tsx
// ✅ AI Agent: Always use Next.js Image component
import Image from 'next/image';

export const OptimizedImage = ({ src, alt }: ImageProps) => (
  <Image
    src={src}
    alt={alt}
    width={800}
    height={600}
    priority={false} // Only for above-the-fold
    placeholder="blur"
    sizes="(max-width: 768px) 100vw, 50vw"
  />
);
```

#### Code Splitting
```tsx
// ✅ AI Agent: Use dynamic imports for heavy components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false, // If client-only
});
```

### Error Handling Patterns

#### Component Error Boundaries
```tsx
// ✅ AI Agent: Always wrap components in error boundaries
'use client';

import { ErrorBoundary } from 'react-error-boundary';

export const ErrorFallback = ({ error }: { error: Error }) => (
  <div role="alert">
    <h2>Something went wrong:</h2>
    <pre>{error.message}</pre>
  </div>
);

export const App = () => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <MyComponent />
  </ErrorBoundary>
);
```

#### Server Action Error Handling
```tsx
// ✅ AI Agent: Always handle errors in Server Actions
export const safeAction = async (data: any) => {
  try {
    const result = await performAction(data);
    return { success: true, data: result };
  } catch (error) {
    console.error('Action failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
```

---

## 📚 Additional Resources

### Official Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

### Best Practices
- [Next.js Best Practices](https://nextjs.org/docs/advanced-features/performance)
- [React Best Practices](https://react.dev/learn)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)

### Tools and Libraries
- [shadcn/ui Components](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query)
- [Zod Validation](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

> 💡 **Remember**: This guide is your **complete Next.js development compass**. Follow these patterns and principles to build scalable, performant, and maintainable applications.

---

**Author**: AI Development Team  
**Date**: January 16, 2025  
**License**: MIT (freely use in your projects and documentation)
