# 🚀 Comprehensive Next.js + Supabase Development Guidelines
## Complete Guide for Cost-Effective, Scalable Applications

**Version:** 1.0  
**Date:** January 16, 2025  
**Status:** Production Ready  
**Target:** AI Assistants (CursorAI), Developers, Architects  
**Stack:** Next.js 15+ • Supabase • Vercel • TypeScript

> **Purpose**: This is your **complete Next.js + Supabase development compass**. A unified source of truth for building cost-effective, scalable, and maintainable applications using Next.js, Supabase, and Vercel deployment.

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start) — 5-minute overview
2. [Architecture Overview](#-architecture-overview) — Core principles and structure
3. [Technology Stack](#-technology-stack) — Next.js + Supabase + Vercel stack
4. [Supabase Integration](#-supabase-integration) — Database, Auth, Storage, Edge Functions
5. [Component Development](#-component-development) — React components and patterns
6. [Routing & Navigation](#-routing--navigation) — App Router patterns and URL-driven UI
7. [Data Management](#-data-management) — Supabase queries, mutations, and real-time
8. [Authentication & Authorization](#-authentication--authorization) — Supabase Auth patterns
9. [Performance Optimization](#-performance-optimization) — Speed, efficiency, and cost optimization
10. [TypeScript Integration](#-typescript-integration) — Type safety with Supabase
11. [Testing Strategies](#-testing-strategies) — Quality assurance
12. [Deployment & DevOps](#-deployment--devops) — Vercel deployment and optimization
13. [Cost Optimization](#-cost-optimization) — Minimizing infrastructure costs
14. [AI Agent Guidelines](#-ai-agent-guidelines) — Specific instructions for AI assistants

---

## 🚀 Quick Start

### For AI Agents: Start Here

**When building a Next.js + Supabase application, follow this decision tree:**

1. **What are you building?**
   - **Page/Route** → Use App Router with `page.tsx`
   - **Component** → Follow FSD + Atomic Design structure
   - **Data mutation** → Use Supabase client or Server Actions
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
   - ✅ **Supabase client in Server Components** for data fetching
   - ✅ **Optimize for Vercel's edge network**

### Essential Commands

```bash
# Create new Next.js project
npx create-next-app@latest my-app --typescript --tailwind --eslint --app

# Add Supabase dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install @hookform/resolvers react-hook-form zod

# Add Vercel CLI
npm install -D vercel

# Initialize Supabase
npx supabase init
npx supabase start

# Run development server
npm run dev
```

### Environment Setup

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 🏗️ Architecture Overview

### Core Principles

1. **Feature-Sliced Design (FSD) 2.1**: Governs project structure and dependency rules
2. **Atomic Design**: Manages UI component hierarchy within `shared/ui`
3. **Server-First Approach**: Default to Server Components, use Client Components only when necessary
4. **Type Safety**: End-to-end TypeScript with Supabase-generated types
5. **Cost Optimization**: Minimize database queries, optimize for Vercel's edge network
6. **Performance First**: Optimize for Core Web Vitals and user experience

### FSD Layer Structure

```
src/
├── shared/           ← Global, framework-agnostic code
│   ├── ui/           ← Atomic components (Atoms, Molecules)
│   ├── lib/          ← Utilities, Supabase client, helpers
│   └── config/       ← Global constants
├── entities/         ← Domain models (User, Post, Category)
│   ├── model/        ← Types, Supabase queries, Server Actions
│   └── ui/           ← Entity-specific UI (rare)
├── features/         ← User actions (Login, Publish)
│   ├── ui/           ← Action components
│   └── model/        ← Hooks, validation, Supabase mutations
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

### Backend & Database
- **Supabase** (PostgreSQL database, Auth, Storage, Edge Functions)
- **PostgreSQL** (Primary database)
- **Row Level Security (RLS)** (Database-level security)

### UI & Styling
- **Tailwind CSS** (Utility-first styling)
- **shadcn/ui** (Component library)
- **Radix UI** (Headless components)
- **Framer Motion** (Animations)

### Data & State
- **Zod** (Schema validation)
- **React Hook Form** (Form management)
- **TanStack Query** (Server state caching)
- **Zustand** (Client state)

### Deployment & Hosting
- **Vercel** (Hosting, Edge Functions, CDN)
- **Vercel Analytics** (Performance monitoring)
- **Vercel Speed Insights** (Core Web Vitals)

### Development Tools
- **ESLint** (Code linting)
- **Prettier** (Code formatting)
- **Husky** (Git hooks)
- **Jest** (Testing)
- **Playwright** (E2E testing)

---

## 🗄️ Supabase Integration

### Database Setup

#### Supabase Client Configuration
```tsx
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
```

#### Server-Side Client
```tsx
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};
```

#### Type Generation
```bash
# Generate TypeScript types from Supabase schema
npx supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

### Database Schema Patterns

#### Entity Tables
```sql
-- Example: Posts table with RLS
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view published posts" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = author_id);
```

#### Optimized Queries
```tsx
// entities/post/model/getPosts.ts
import { createClient } from '@/lib/supabase/server';

export const getPosts = async (limit = 10, offset = 0) => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      created_at,
      author:profiles!posts_author_id_fkey(
        id,
        username,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
    
  if (error) throw error;
  return data;
};
```

### Real-time Subscriptions

#### Real-time Data
```tsx
// features/posts/model/usePostsSubscription.ts
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Post } from '@/entities/post/model/types';

export const usePostsSubscription = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const supabase = createClient();
  
  useEffect(() => {
    const channel = supabase
      .channel('posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPosts(prev => [payload.new as Post, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPosts(prev => 
              prev.map(post => 
                post.id === payload.new.id ? payload.new as Post : post
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setPosts(prev => 
              prev.filter(post => post.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);
  
  return posts;
};
```

---

## 🧩 Component Development

### Server Components (Default)

**Use Server Components by default** - they're faster, more secure, and cost-effective.

```tsx
// ✅ Server Component with Supabase data
import { getPosts } from '@/entities/post/model/getPosts';

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

### Client Components (When Needed)

**Only use Client Components when you need:**
- Real-time subscriptions
- Form interactions
- Browser APIs
- State management

```tsx
// ✅ Client Component for real-time data
'use client';

import { usePostsSubscription } from '@/features/posts/model/usePostsSubscription';

export const RealTimePosts = () => {
  const posts = usePostsSubscription();
  
  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};
```

### Atomic Design Structure

#### Atoms (Basic UI Elements)
```tsx
// shared/ui/atoms/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  children, 
  onClick 
}: ButtonProps) => {
  return (
    <button
      disabled={loading}
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

#### Molecules (Composed Atoms)
```tsx
// shared/ui/molecules/SearchField.tsx
import { Input } from '@/shared/ui/atoms/Input';
import { Button } from '@/shared/ui/atoms/Button';

interface SearchFieldProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  loading?: boolean;
}

export const SearchField = ({ 
  placeholder = 'Search...', 
  onSearch, 
  loading = false 
}: SearchFieldProps) => {
  const [query, setQuery] = useState('');
  
  return (
    <div className="flex gap-2">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        disabled={loading}
      />
      <Button 
        onClick={() => onSearch(query)}
        loading={loading}
        disabled={!query.trim()}
      >
        Search
      </Button>
    </div>
  );
};
```

### Supabase-Specific Components

#### Data Loading Component
```tsx
// shared/ui/molecules/DataLoader.tsx
interface DataLoaderProps<T> {
  children: (data: T | null, loading: boolean, error: Error | null) => React.ReactNode;
  queryFn: () => Promise<T>;
  dependencies?: any[];
}

export const DataLoader = <T,>({ 
  children, 
  queryFn, 
  dependencies = [] 
}: DataLoaderProps<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    queryFn()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, dependencies);
  
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
    └── posts/
        └── route.ts
```

### URL-Driven UI Patterns

#### Parallel Routes with Supabase
```tsx
// app/dashboard/layout.tsx
import { createClient } from '@/lib/supabase/server';

export default async function DashboardLayout({
  children,
  modal
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return (
    <div className="flex">
      <Sidebar user={user} />
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
import { EditPostModal } from '@/features/post-edit/ui/EditPostModal';

export default function EditPostModalPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return <EditPostModal postId={params.id} />;
}

// app/dashboard/(..)edit/[id]/page.tsx
import { EditPostModal } from '@/features/post-edit/ui/EditPostModal';

export default function EditPostPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return <EditPostModal postId={params.id} />;
}
```

### Route Protection

#### Authentication Middleware
```tsx
// middleware.ts
import { createMiddlewareClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith('/login') && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register']
};
```

---

## 📊 Data Management

### Supabase Queries

#### Server-Side Data Fetching
```tsx
// entities/post/model/getPost.ts
import { createClient } from '@/lib/supabase/server';

export const getPost = async (id: string) => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(
        id,
        username,
        avatar_url
      ),
      comments:post_comments(
        id,
        content,
        created_at,
        author:profiles!post_comments_author_id_fkey(
          id,
          username,
          avatar_url
        )
      )
    `)
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
};
```

#### Client-Side Data Fetching
```tsx
// features/posts/model/usePostsQuery.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export const usePostsQuery = (filters?: PostFilters) => {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['posts', filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(
            id,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### Server Actions with Supabase

#### Entity-Level Actions
```tsx
// entities/post/model/createPostAction.ts
'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const CreatePostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
  category_id: z.string().uuid(),
});

export const createPostAction = async (data: z.infer<typeof CreatePostSchema>) => {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }
    
    // Validate input
    const validatedData = CreatePostSchema.parse(data);
    
    // Create post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        ...validatedData,
        author_id: user.id,
      })
      .select()
      .single();
      
    if (error) throw error;
    
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
// features/post-edit/model/updatePostAction.ts
'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const UpdatePostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  content: z.string().min(1),
});

export const updatePostAction = async (data: z.infer<typeof UpdatePostSchema>) => {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }
    
    // Validate input
    const validatedData = UpdatePostSchema.parse(data);
    
    // Check ownership
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', validatedData.id)
      .single();
      
    if (fetchError || post.author_id !== user.id) {
      throw new Error('Post not found or unauthorized');
    }
    
    // Update post
    const { error } = await supabase
      .from('posts')
      .update({
        title: validatedData.title,
        content: validatedData.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedData.id);
      
    if (error) throw error;
    
    // Revalidate cache
    revalidatePath('/posts');
    revalidatePath(`/posts/${validatedData.id}`);
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Update failed' 
    };
  }
};
```

---

## 🔐 Authentication & Authorization

### Supabase Auth Setup

#### Auth Configuration
```tsx
// lib/auth/config.ts
export const authConfig = {
  providers: {
    email: {
      enabled: true,
      confirmEmail: true,
    },
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID,
    },
    github: {
      enabled: true,
      clientId: process.env.GITHUB_CLIENT_ID,
    },
  },
  redirectTo: process.env.NEXT_PUBLIC_SITE_URL + '/dashboard',
};
```

#### Auth Components
```tsx
// features/auth/ui/LoginForm.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/shared/ui/atoms/Button';
import { Input } from '@/shared/ui/atoms/Input';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-red-500">{error}</p>}
      <Button type="submit" loading={loading} className="w-full">
        Login
      </Button>
    </form>
  );
};
```

#### Auth Hooks
```tsx
// features/auth/model/useAuth.ts
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  
  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    
    getSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );
    
    return () => subscription.unsubscribe();
  }, [supabase]);
  
  return { user, loading };
};
```

### Row Level Security (RLS)

#### RLS Policies
```sql
-- Enable RLS on posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Users can view all published posts
CREATE POLICY "Public posts are viewable by everyone" ON posts
  FOR SELECT USING (published = true);

-- Users can view their own posts (published or not)
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT USING (auth.uid() = author_id);

-- Users can create posts
CREATE POLICY "Users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = author_id);
```

#### RLS Helper Functions
```tsx
// lib/supabase/rls.ts
import { createClient } from '@/lib/supabase/server';

export const checkUserPermission = async (
  table: string, 
  recordId: string, 
  userId: string
) => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .eq('id', recordId)
    .eq('author_id', userId)
    .single();
    
  return { hasPermission: !!data && !error, error };
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
import { getPost } from '@/entities/post/model/getPost';

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
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

### Database Optimization

#### Query Optimization
```tsx
// Optimized query with proper indexing
export const getPostsWithAuthors = async (limit = 10) => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      created_at,
      author:profiles!posts_author_id_fkey(
        id,
        username,
        avatar_url
      )
    `)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) throw error;
  return data;
};
```

#### Connection Pooling
```tsx
// lib/supabase/connection.ts
import { createClient } from '@supabase/supabase-js';

// Use connection pooling for better performance
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'x-application-name': 'my-app',
      },
    },
  }
);
```

### Image Optimization

```tsx
import Image from 'next/image';

export const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height 
}: ImageProps) => {
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

---

## 🔷 TypeScript Integration

### Supabase Type Generation

#### Database Types
```typescript
// types/supabase.ts
export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          author_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          author_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          author_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
```

#### Type-Safe Queries
```tsx
// entities/post/model/types.ts
import type { Database } from '@/types/supabase';

type Post = Database['public']['Tables']['posts']['Row'];
type PostInsert = Database['public']['Tables']['posts']['Insert'];
type PostUpdate = Database['public']['Tables']['posts']['Update'];

export type { Post, PostInsert, PostUpdate };

// Type-safe query function
export const getPost = async (id: string): Promise<Post> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
};
```

### Zod Schema Validation

#### Input Validation
```tsx
// entities/post/model/post.schema.ts
import { z } from 'zod';

export const PostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
  category_id: z.string().uuid(),
});

export const UpdatePostSchema = PostSchema.partial().extend({
  id: z.string().uuid(),
});

export type PostInput = z.infer<typeof PostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;
```

#### Server Action with Validation
```tsx
// entities/post/model/createPostAction.ts
'use server';

import { PostSchema } from './post.schema';
import { createClient } from '@/lib/supabase/server';

export const createPostAction = async (data: unknown) => {
  try {
    // Validate input
    const validatedData = PostSchema.parse(data);
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Unauthorized');
    
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        ...validatedData,
        author_id: user.id,
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return { success: true, post };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
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
});
```

#### Supabase Mocking
```tsx
// __tests__/lib/supabase-mock.ts
import { vi } from 'vitest';

export const createMockSupabaseClient = () => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => ({
          data: { id: '1', title: 'Test Post' },
          error: null,
        })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: { id: '1', title: 'Test Post' },
          error: null,
        })),
      })),
    })),
  })),
  auth: {
    getUser: vi.fn(() => ({
      data: { user: { id: '1', email: 'test@example.com' } },
      error: null,
    })),
  },
});
```

### Integration Testing

#### Server Action Testing
```tsx
// __tests__/actions/createPostAction.test.ts
import { createPostAction } from '@/entities/post/model/createPostAction';
import { createMockSupabaseClient } from '../lib/supabase-mock';

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => createMockSupabaseClient(),
}));

describe('createPostAction', () => {
  it('creates a post successfully', async () => {
    const postData = {
      title: 'Test Post',
      content: 'Test content',
      category_id: 'category-1',
    };

    const result = await createPostAction(postData);

    expect(result.success).toBe(true);
    expect(result.post).toMatchObject({
      title: postData.title,
      content: postData.content,
    });
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

### Vercel Configuration

#### Next.js Configuration
```tsx
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
  // Vercel-specific optimizations
  output: 'standalone',
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

module.exports = nextConfig;
```

#### Vercel Environment Variables
```bash
# Production environment variables
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
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
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Vercel Edge Functions

#### Edge Function Example
```tsx
// app/api/hello/route.ts
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select('count')
    .single();
    
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  
  return Response.json({ count: data.count });
}
```

---

## 💰 Cost Optimization

### Database Optimization

#### Query Optimization
```tsx
// Optimize queries to reduce database calls
export const getPostsWithOptimizedQuery = async () => {
  const supabase = await createClient();
  
  // Single query instead of multiple
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      created_at,
      author:profiles!posts_author_id_fkey(
        id,
        username,
        avatar_url
      )
    `)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(20); // Limit results
    
  if (error) throw error;
  return data;
};
```

#### Connection Pooling
```tsx
// Use connection pooling to reduce costs
export const createOptimizedClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: {
        schema: 'public',
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          'x-application-name': 'my-app',
        },
      },
    }
  );
};
```

### Caching Strategies

#### Static Generation
```tsx
// Use static generation to reduce server costs
export const revalidate = 3600; // 1 hour

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

#### Client-Side Caching
```tsx
// Use TanStack Query for client-side caching
export const usePostsQuery = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

### Vercel Optimization

#### Edge Functions
```tsx
// Use Edge Functions for better performance and lower costs
export const runtime = 'edge';

export async function GET() {
  // Edge function code
  return Response.json({ message: 'Hello from Edge!' });
}
```

#### Image Optimization
```tsx
// Use Vercel's image optimization
import Image from 'next/image';

export const OptimizedImage = ({ src, alt }: ImageProps) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      priority={false}
      placeholder="blur"
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  );
};
```

---

## 🤖 AI Agent Guidelines

### Code Generation Rules

#### Component Creation
```tsx
// ✅ AI Agent: When creating a component, follow this pattern:

// 1. Start with Server Component (default)
export default async function ComponentName({ params }: { params: { id: string } }) {
  // Server-side data fetching with Supabase
  const supabase = await createClient();
  const { data } = await supabase.from('table').select('*').eq('id', params.id);
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}

// 2. Add 'use client' only when needed
'use client';

export const ClientComponent = () => {
  // Client-side logic with Supabase
  const supabase = createClient();
  return <div>Client Component</div>;
};
```

#### Server Action Creation
```tsx
// ✅ AI Agent: When creating Server Actions with Supabase, follow this pattern:

'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
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
    
    // 2. Get Supabase client
    const supabase = await createClient();
    
    // 3. Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');
    
    // 4. Perform action
    const { data: result, error } = await supabase
      .from('table')
      .insert(validatedData)
      .select()
      .single();
      
    if (error) throw error;
    
    // 5. Revalidate cache
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
├── shared/lib/               ← Utilities, Supabase client
├── entities/{name}/model/    ← Domain logic, Supabase queries
├── entities/{name}/ui/       ← Entity-specific UI
├── features/{name}/model/    ← Business logic, Supabase mutations
├── features/{name}/ui/       ← Feature components
├── widgets/{name}/ui/        ← Complex UI blocks
└── pages/                    ← Next.js routes
```

#### Import Rules
```tsx
// ✅ Correct imports (downward only)
import { Button } from '@/shared/ui/atoms/Button';
import { createClient } from '@/shared/lib/supabase/server';
import { User } from '@/entities/user/model/User';
import { useAuth } from '@/features/auth/model/useAuth';

// ❌ Incorrect imports (upward)
import { Dashboard } from '@/pages/dashboard'; // shared cannot import from pages
import { UserCard } from '@/widgets/user-card'; // entities cannot import from widgets
```

### Performance Optimization Rules

#### Database Queries
```tsx
// ✅ AI Agent: Always optimize Supabase queries
export const getOptimizedData = async () => {
  const supabase = await createClient();
  
  // Use select to limit fields
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, created_at') // Only select needed fields
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(20); // Limit results
    
  if (error) throw error;
  return data;
};
```

#### Caching
```tsx
// ✅ AI Agent: Always implement caching strategies
export const useCachedQuery = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

### Error Handling Patterns

#### Supabase Error Handling
```tsx
// ✅ AI Agent: Always handle Supabase errors properly
export const safeQuery = async () => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('table').select('*');
    
    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error('Query failed:', error);
    return null;
  }
};
```

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

---

## 📚 Additional Resources

### Official Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [React Documentation](https://react.dev)

### Best Practices
- [Next.js Best Practices](https://nextjs.org/docs/advanced-features/performance)
- [Supabase Best Practices](https://supabase.com/docs/guides/database/best-practices)
- [Vercel Best Practices](https://vercel.com/docs/concepts/functions/serverless-functions)

### Tools and Libraries
- [shadcn/ui Components](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query)
- [Zod Validation](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

> 💡 **Remember**: This guide is your **complete Next.js + Supabase development compass**. Follow these patterns and principles to build cost-effective, scalable, and maintainable applications.

---

**Author**: AI Development Team  
**Date**: January 16, 2025  
**License**: MIT (freely use in your projects and documentation)
