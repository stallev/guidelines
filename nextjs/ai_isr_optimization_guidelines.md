# ISR Optimization Guidelines for Next.js 15.5.9

**Версия документа:** 1.0  
**Дата создания:** 27 декабря 2025  
**Проект:** Sunday School App  
**Технологии:** Next.js 15.5.9, AWS Amplify Gen 1, AWS AppSync, AWS Cognito

---

## Оглавление

1. [Введение и обзор](#1-введение-и-обзор)
2. [Когда использовать ISR](#2-когда-использовать-isr)
3. [Базовая настройка](#3-базовая-настройка)
4. [On-Demand Revalidation в Server Actions](#4-on-demand-revalidation-в-server-actions)
5. [Использование revalidateTag для точной ревалидации](#5-использование-revalidatetag-для-точной-ревалидации)
6. [Примеры реализации для разных типов страниц](#6-примеры-реализации-для-разных-типов-страниц)
7. [Интеграция с middleware и аутентификацией](#7-интеграция-с-middleware-и-аутентификацией)
8. [Best Practices](#8-best-practices)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Введение и обзор

### 1.1. Что такое ISR (Incremental Static Regeneration)

**ISR (Incremental Static Regeneration)** — это механизм Next.js, который позволяет генерировать статические страницы во время выполнения (runtime) и кешировать их для последующих запросов.

**Ключевые особенности:**
- Страницы генерируются при первом запросе и кешируются
- Автоматическая ревалидация через заданный интервал времени
- On-demand ревалидация через `revalidatePath` и `revalidateTag`
- Совместимость с аутентификацией и middleware
- Работает с приватными данными (требует аутентификации при генерации)

### 1.2. Преимущества ISR

**Производительность:**
- ✅ Значительное улучшение времени загрузки для повторных запросов
- ✅ Снижение нагрузки на AppSync/GraphQL API
- ✅ Кеширование на уровне Next.js
- ✅ Автоматическая ревалидация обеспечивает актуальность данных

**Безопасность:**
- ✅ Middleware продолжает защищать маршруты
- ✅ Server Actions проверяют аутентификацию и авторизацию
- ✅ Данные не доступны без авторизации

**Гибкость:**
- ✅ On-demand ревалидация после изменений
- ✅ Настраиваемый интервал ревалидации
- ✅ Работает с динамическими маршрутами

### 1.3. Отличия от других подходов

| Подход | Когда генерируется | Ревалидация | Использование |
|--------|-------------------|-------------|---------------|
| **SSG (Static Site Generation)** | При сборке (`npm run build`) | Только при пересборке | Публичные страницы |
| **ISR** | При первом запросе | Автоматическая + On-demand | Приватные страницы с кешированием |
| **SSR (Server-Side Rendering)** | При каждом запросе | Нет | Динамические данные, нет кеширования |
| **CSR (Client-Side Rendering)** | На клиенте | Нет | Интерактивные компоненты |

---

## 2. Когда использовать ISR

### 2.1. Критерии использования ISR

**Используйте ISR когда:**
- ✅ Страница требует аутентификации, но данные не меняются очень часто
- ✅ Нужно улучшить производительность для повторных запросов
- ✅ Данные обновляются периодически (не при каждом запросе)
- ✅ Страница доступна авторизованным пользователям
- ✅ Нужно снизить нагрузку на API (AppSync, GraphQL)

**НЕ используйте ISR когда:**
- ❌ Данные меняются при каждом запросе (реал-тайм данные)
- ❌ Страница полностью публичная (используйте SSG)
- ❌ Нужна максимальная актуальность данных без задержек
- ❌ Страница содержит персональные данные, уникальные для каждого пользователя

### 2.2. Примеры использования в проекте

**Подходит для ISR:**
- Список групп (`/grades`) — данные меняются редко
- Детальная страница группы (`/grades/[gradeId]`) — данные обновляются при редактировании
- Список уроков (`/lessons`) — данные меняются периодически
- Список учеников (`/pupils`) — данные обновляются редко

**НЕ подходит для ISR:**
- Страница профиля пользователя — персональные данные
- Дашборд с реал-тайм статистикой — данные меняются постоянно
- Страница входа (`/auth`) — публичная страница, используйте SSG

---

## 3. Базовая настройка

### 3.1. Замена `force-dynamic` на `revalidate`

**До (динамическая генерация):**
```typescript
export const dynamic = 'force-dynamic';

export default async function Page() {
  // ...
}
```

**После (ISR с ревалидацией):**
```typescript
export const revalidate = 60; // Ревалидация каждые 60 секунд

export default async function Page() {
  // ...
}
```

### 3.2. Выбор интервала ревалидации

**Рекомендации по выбору интервала:**

| Интервал | Использование | Примеры |
|----------|---------------|---------|
| `60` (1 минута) | Данные меняются часто | Списки с активными обновлениями |
| `300` (5 минут) | Данные меняются периодически | Списки групп, уроков |
| `3600` (1 час) | Данные меняются редко | Справочники, настройки |
| `false` | Только on-demand ревалидация | Данные обновляются только при изменениях |

**Для MVP рекомендуется:** `60` секунд (баланс между актуальностью и производительностью)

### 3.3. Пример базовой настройки

```typescript
/**
 * Grades List Page (Admin)
 * Server Component for displaying all grades for Admin users
 * Mobile-first responsive design
 * Uses ISR with 60-second revalidation for optimal performance
 */

export const revalidate = 60; // ISR: revalidate every 60 seconds

import { redirect } from 'next/navigation';
import { getAuthenticatedUser, checkRole } from '@/lib/auth/cognito';
import { listGradesAction } from '@/actions/grades';

export default async function GradesPage() {
  // Check authentication
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect('/auth');
  }

  // Check authorization
  const isAdmin = checkRole(user, ['ADMIN', 'SUPERADMIN']);
  if (!isAdmin) {
    redirect('/grades/my');
  }

  // Fetch grades (will be cached after first request)
  const result = await listGradesAction();
  
  // ... render page
}
```

---

## 4. On-Demand Revalidation в Server Actions

### 4.1. Использование `revalidatePath`

**Когда использовать:**
- После создания, обновления или удаления данных
- Когда нужно ревалидировать конкретный путь
- Для совместимости со всеми версиями Next.js

**Пример:**
```typescript
import { revalidatePath } from 'next/cache';

export async function createGradeAction(input: unknown) {
  // ... validation and creation logic ...

  // Revalidate pages after creation
  revalidatePath('/grades');
  revalidatePath('/(private)/grades');

  return { success: true, data: grade };
}
```

### 4.2. Ревалидация динамических маршрутов

**Для детальных страниц:**
```typescript
export async function updateGradeAction(input: unknown) {
  const validatedData = validationResult.data;
  
  // ... update logic ...

  // Revalidate list page
  revalidatePath('/grades');
  // Revalidate specific detail page
  revalidatePath(`/grades/${validatedData.id}`);
  // Revalidate route group
  revalidatePath('/(private)/grades');

  return { success: true, data: grade };
}
```

### 4.3. Ревалидация после удаления

```typescript
export async function deleteGradeAction(input: unknown) {
  const { id } = validationResult.data;
  
  // ... delete logic ...

  // Revalidate list page (detail page will 404, which is correct)
  revalidatePath('/grades');
  revalidatePath('/(private)/grades');

  return { success: true, data: { id } };
}
```

---

## 5. Использование revalidateTag для точной ревалидации

### 5.1. Преимущества `revalidateTag`

**Преимущества:**
- ✅ Более точная ревалидация (только связанные данные)
- ✅ Можно ревалидировать несколько страниц одним тегом
- ✅ Гибкость в управлении кешем
- ✅ Работает с fetch запросами (если используются)

**Ограничения:**
- ⚠️ Требует добавления tags в fetch запросы (если используются)
- ⚠️ Server Actions не используют fetch напрямую, поэтому tags нужно добавлять вручную

### 5.2. Комбинированный подход (рекомендуется)

**Используйте оба подхода для максимальной совместимости:**

```typescript
import { revalidatePath, revalidateTag } from 'next/cache';

export async function createGradeAction(input: unknown) {
  // ... creation logic ...

  // Use tags for precise cache invalidation
  revalidateTag('grades');
  revalidateTag(`grade-${grade.id}`);
  
  // Also revalidate paths for compatibility
  revalidatePath('/grades');
  revalidatePath('/(private)/grades');

  return { success: true, data: grade };
}
```

### 5.3. Соглашения по именованию тегов

**Рекомендуемые паттерны:**
- `'grades'` — общий тег для всех страниц со списком групп
- `'grade-{id}'` — тег для конкретной группы
- `'lessons'` — общий тег для всех страниц со списком уроков
- `'lesson-{id}'` — тег для конкретного урока

**Пример:**
```typescript
// General tag for all grades pages
revalidateTag('grades');

// Specific tag for a grade
revalidateTag(`grade-${gradeId}`);
```

---

## 6. Примеры реализации для разных типов страниц

### 6.1. Список сущностей (List Pages)

**Файл:** `src/app/(private)/grades/page.tsx`

```typescript
/**
 * Grades List Page (Admin)
 * Uses ISR with 60-second revalidation
 */

export const revalidate = 60;

export default async function GradesPage() {
  // Authentication and authorization checks
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect('/auth');
  }

  // Fetch data (cached after first request)
  const result = await listGradesAction();
  
  // Render page
  return (
    <div>
      {/* Page content */}
    </div>
  );
}
```

### 6.2. Детальные страницы (Detail Pages)

**Файл:** `src/app/(private)/grades/[gradeId]/page.tsx`

```typescript
/**
 * Grade Detail Page
 * Uses ISR with 60-second revalidation
 */

export const revalidate = 60;

/**
 * Generate static params for ISR (optional for MVP)
 * For MVP, returns empty array - paths will be generated on-demand
 */
export async function generateStaticParams() {
  // For MVP: paths are generated on-demand
  // In production, you could pre-generate known grade IDs here
  return [];
}

export default async function GradeDetailPage({
  params,
}: {
  params: Promise<{ gradeId: string }>;
}) {
  const { gradeId } = await params;

  // Authentication and authorization checks
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect('/auth');
  }

  // Fetch data (cached after first request)
  const result = await getGradeWithFullDataAction({ id: gradeId });
  
  // Render page
  return (
    <div>
      {/* Page content */}
    </div>
  );
}
```

### 6.3. Server Actions с ревалидацией

**Файл:** `src/actions/grades.ts`

```typescript
import { revalidatePath, revalidateTag } from 'next/cache';

export async function createGradeAction(
  input: unknown
): Promise<ActionResponse<APITypes.Grade>> {
  try {
    // 1. Validate input
    // 2. Check authentication
    // 3. Check authorization
    // 4. Create grade
    const grade = await createGrade({ /* ... */ });

    // 5. Revalidate cache
    // Use tags for precise cache invalidation
    revalidateTag('grades');
    revalidateTag(`grade-${grade.id}`);
    // Also revalidate paths for compatibility
    revalidatePath('/grades');
    revalidatePath('/(private)/grades');

    return {
      success: true,
      data: grade,
      message: 'Grade created successfully',
    };
  } catch (error) {
    // Error handling
  }
}
```

---

## 7. Интеграция с middleware и аутентификацией

### 7.1. Совместимость с middleware

**ISR полностью совместим с middleware:**

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const idToken = request.cookies.get('cognito-id-token')?.value;

  // Middleware continues to check authentication
  if (!idToken || isTokenExpired(idToken)) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Allow access to protected routes
  return NextResponse.next();
}
```

**Как это работает:**
1. Middleware проверяет аутентификацию перед доступом к странице
2. Если пользователь авторизован, страница генерируется (первый запрос) или берется из кеша (повторные запросы)
3. Middleware работает одинаково для всех запросов

### 7.2. Проверка доступа в Server Components

**Проверка доступа остается в Server Components:**

```typescript
export default async function Page() {
  // Authentication check (required for first request)
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect('/auth');
  }

  // Authorization check
  const isAdmin = checkRole(user, ['ADMIN', 'SUPERADMIN']);
  if (!isAdmin) {
    redirect('/grades/my');
  }

  // Fetch data (requires authentication)
  const result = await listGradesAction();
  
  // Render page
}
```

**Важно:**
- Первый запрос требует аутентификации (страница генерируется)
- Повторные запросы обслуживаются из кеша (но middleware все равно проверяет доступ)
- Данные не доступны без авторизации

### 7.3. Server Actions и аутентификация

**Server Actions продолжают проверять аутентификацию:**

```typescript
export async function createGradeAction(input: unknown) {
  // Authentication check (always required)
  const user = await getAuthenticatedUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Authorization check
  if (!checkRole(user, ['ADMIN', 'SUPERADMIN'])) {
    return { success: false, error: 'Forbidden' };
  }

  // Create grade
  const grade = await createGrade({ /* ... */ });

  // Revalidate cache
  revalidatePath('/grades');

  return { success: true, data: grade };
}
```

---

## 8. Best Practices

### 8.1. Выбор интервала ревалидации

**Рекомендации:**
- Начните с `60` секунд для MVP
- Увеличьте интервал, если данные меняются редко
- Используйте `false` для только on-demand ревалидации, если данные обновляются только при изменениях

### 8.2. Использование tags vs paths

**Рекомендация:** Используйте оба подхода для максимальной совместимости:
- `revalidateTag` — для точной ревалидации связанных данных
- `revalidatePath` — для совместимости и гарантированной ревалидации

### 8.3. Ревалидация после операций

**Всегда ревалидируйте после:**
- ✅ Создания новой сущности
- ✅ Обновления существующей сущности
- ✅ Удаления сущности
- ✅ Изменения связей между сущностями

### 8.4. Оптимизация для AWS Amplify Hosting

**Совместимость:**
- ✅ ISR полностью поддерживается AWS Amplify Hosting
- ✅ `revalidatePath` и `revalidateTag` работают корректно
- ✅ Next.js 15.5.9 полностью совместим

**Рекомендации:**
- Используйте стандартные Next.js API (`revalidatePath`, `revalidateTag`)
- Не используйте кастомные решения для кеширования
- Тестируйте на AWS Amplify Hosting перед деплоем

### 8.5. Тестирование ISR

**Проверьте:**
1. Страницы кешируются после первого запроса
2. Ревалидация работает после создания/обновления/удаления
3. Middleware продолжает работать корректно
4. Производительность (время загрузки из кеша)

**Метрики:**
- Время первой загрузки (TTFB - Time To First Byte)
- Время загрузки из кеша
- Количество запросов к AppSync

---

## 9. Troubleshooting

### 9.1. Страница не кешируется

**Проблема:** Страница генерируется при каждом запросе

**Возможные причины:**
- Не указан `export const revalidate`
- Используется `export const dynamic = 'force-dynamic'`
- Ошибки при генерации страницы

**Решение:**
```typescript
// Убедитесь, что используете revalidate, а не dynamic
export const revalidate = 60; // ✅ Правильно
// export const dynamic = 'force-dynamic'; // ❌ Неправильно
```

### 9.2. Ревалидация не работает

**Проблема:** Страница не обновляется после изменений

**Возможные причины:**
- Не вызывается `revalidatePath` или `revalidateTag` в Server Actions
- Неправильный путь в `revalidatePath`
- Ошибки в Server Actions (ревалидация не достигается)

**Решение:**
```typescript
// Убедитесь, что ревалидация вызывается после успешных операций
export async function createGradeAction(input: unknown) {
  try {
    const grade = await createGrade({ /* ... */ });
    
    // Ревалидация должна быть после успешной операции
    revalidatePath('/grades');
    revalidateTag('grades');
    
    return { success: true, data: grade };
  } catch (error) {
    // Ревалидация не вызывается при ошибках
    return { success: false, error: '...' };
  }
}
```

### 9.3. Middleware блокирует доступ

**Проблема:** Middleware редиректит на `/auth` даже для кешированных страниц

**Причина:** Это нормальное поведение — middleware всегда проверяет аутентификацию

**Решение:** Это не проблема, это ожидаемое поведение. Middleware должен проверять доступ для всех запросов, включая кешированные страницы.

### 9.4. Данные устарели

**Проблема:** Страница показывает устаревшие данные

**Возможные причины:**
- Интервал ревалидации слишком большой
- On-demand ревалидация не вызывается после изменений

**Решение:**
1. Уменьшите интервал ревалидации:
```typescript
export const revalidate = 60; // Вместо 3600
```

2. Убедитесь, что ревалидация вызывается в Server Actions:
```typescript
revalidatePath('/grades');
revalidateTag('grades');
```

### 9.5. Проверка работы ISR

**Как проверить, что ISR работает:**

1. **Первый запрос:**
   - Откройте страницу в браузере
   - Проверьте Network tab — должен быть запрос к серверу
   - Время загрузки может быть больше (генерация страницы)

2. **Повторные запросы:**
   - Обновите страницу несколько раз
   - Проверьте Network tab — запросы должны быть быстрее
   - Время загрузки должно быть значительно меньше (из кеша)

3. **После ревалидации:**
   - Создайте/обновите данные через форму
   - Обновите страницу — должны отобразиться новые данные
   - Проверьте, что ревалидация сработала

---

## 10. Связанные документы

- [ISR Optimization Analysis](../../optimization/GRADES_PAGES_ISR_OPTIMIZATION.md) — детальный анализ ISR оптимизации
- [Server Actions Documentation](../../api/SERVER_ACTIONS.md) — документация по Server Actions
- [Architecture Documentation](../../architecture/ARCHITECTURE.md) — архитектура проекта
- [AWS Amplify Compatibility](../../infrastructure/AMPLIFY_COMPATIBILITY.md) — совместимость с AWS Amplify

---

**Документ создан:** 27 декабря 2025  
**Автор:** CursorAI Agent  
**Версия:** 1.0

