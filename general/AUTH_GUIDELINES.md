# Authentication Guidelines

## Версия документа: 1.0
**Дата создания:** 23.11.2025  
**Проект:** Landing Page + Admin Dashboard  
**Назначение:** Руководство по аутентификации с Auth.js v5

---

## 📋 О документе

Этот документ описывает настройку и использование Auth.js v5 (NextAuth.js) для аутентификации в проекте.

**Обязательные требования:**
- При работе с Server Actions следовать [`SERVER_ACTIONS_GUIDELINES.md`](./SERVER_ACTIONS_GUIDELINES.md)
- При создании компонентов следовать [`docs/guidelines/react/ai_component_guidelines.md`](../react/ai_component_guidelines.md)

---

## I. AUTH.JS SETUP

### 1.1. Конфигурация Auth.js

```typescript
// lib/auth/auth.config.ts

import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        
        if (!parsed.success) {
          return null;
        }
        
        const { email, password } = parsed.data;
        
        const user = await prisma.user.findUnique({
          where: { email },
        });
        
        if (!user || !user.password) {
          return null;
        }
        
        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
          return null;
        }
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'ADMIN';
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
} satisfies NextAuthConfig;
```

```typescript
// lib/auth/auth.ts

import NextAuth from 'next-auth';
import authConfig from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
```

---

## II. ПРОВЕРКА АУТЕНТИФИКАЦИИ

### 2.1. В Server Components

```typescript
// app/admin/dashboard/page.tsx

import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/admin/login');
  }
  
  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }
  
  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
    </div>
  );
}
```

### 2.2. В Server Actions

```typescript
// actions/services.ts
'use server';

import { auth } from '@/lib/auth/auth';

export async function createService(formData: FormData) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }
  
  // Продолжаем выполнение...
}
```

### 2.3. В Client Components

```typescript
'use client';

import { useSession } from 'next-auth/react';

export const UserProfile = () => {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (status === 'unauthenticated') {
    return <div>Not authenticated</div>;
  }
  
  return (
    <div>
      <p>Welcome, {session?.user?.name}</p>
      <p>Email: {session?.user?.email}</p>
    </div>
  );
};
```

---

## III. LOGIN PAGE

### 3.1. Login форма

```typescript
// app/admin/login/page.tsx
'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Неверный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard';
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    
    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Неверный email или пароль');
      } else {
        toast.success('Вход выполнен');
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      toast.error('Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Вход в админ-панель</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Пароль</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Вход...' : 'Войти'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## IV. LOGOUT

### 4.1. Sign Out Button

```typescript
// components/admin/SignOutButton.tsx
'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export const SignOutButton = () => {
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: '/admin/login',
    });
  };

  return (
    <Button
      variant="ghost"
      onClick={handleSignOut}
      className="w-full justify-start"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Выйти
    </Button>
  );
};
```

---

## V. MIDDLEWARE (Защита маршрутов)

### 5.1. Middleware конфигурация

```typescript
// src/middleware.ts (будет создан на финальной стадии)

import { auth } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';

const protectedRoutes = ['/admin/dashboard'];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  
  const isProtectedRoute = protectedRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  );
  
  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(
      new URL(`/admin/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }
  
  // Redirect to dashboard if accessing login while logged in
  if (nextUrl.pathname === '/admin/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin/dashboard', nextUrl));
  }
  
  // Check admin access
  if (isProtectedRoute && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', nextUrl));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## VI. TYPESCRIPT TYPES

### 6.1. Расширение NextAuth типов

```typescript
// types/next-auth.d.ts

import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: 'ADMIN';
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'ADMIN';
  }
}
```

---

## VII. ENVIRONMENT VARIABLES

### 7.1. Обязательные переменные

```env
# .env.local

# Auth.js Secret (генерируется: openssl rand -base64 32)
AUTH_SECRET="your-secret-key-here"

# App URL
NEXTAUTH_URL="http://localhost:3000"

# Production
# NEXTAUTH_URL="https://your-domain.com"
```

---

## VIII. CHECKLIST

### 8.1. Checklist для аутентификации

- [ ] **Конфигурация**
  - [ ] Auth.js настроен в `lib/auth/`
  - [ ] Credentials provider настроен
  - [ ] JWT callbacks настроены
  - [ ] Session strategy: 'jwt'

- [ ] **Environment**
  - [ ] AUTH_SECRET установлен
  - [ ] NEXTAUTH_URL установлен

- [ ] **Login page**
  - [ ] Форма входа создана
  - [ ] Валидация через Zod
  - [ ] Error handling
  - [ ] Toast notifications

- [ ] **Защита маршрутов**
  - [ ] Middleware настроен (на финальной стадии)
  - [ ] Server Components проверяют auth
  - [ ] Server Actions проверяют auth
  - [ ] Redirect на login при отсутствии auth

- [ ] **TypeScript**
  - [ ] Types расширены в `types/next-auth.d.ts`
  - [ ] User interface с role
  - [ ] Session interface с role

---

## IX. СВЯЗАННЫЕ ДОКУМЕНТЫ

- [`SERVER_ACTIONS_GUIDELINES.md`](./SERVER_ACTIONS_GUIDELINES.md) - Аутентификация в Server Actions
- [`docs/guidelines/react/ai_component_guidelines.md`](../react/ai_component_guidelines.md) - Паттерны компонентов
- [Auth.js Documentation](https://authjs.dev/) - Официальная документация

---

**Версия документа:** 1.0  
**Последнее обновление:** 23.11.2025  
**Статус:** ✅ Актуально

