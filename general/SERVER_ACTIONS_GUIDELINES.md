# Server Actions Guidelines

## Версия документа: 1.0
**Дата создания:** 23.11.2025  
**Проект:** Landing Page + Admin Dashboard  
**Назначение:** Comprehensive руководство по Server Actions в Next.js 16

---

## 📋 О документе

Этот документ описывает best practices для создания Server Actions в Next.js 16. Server Actions - это серверные функции, которые могут быть вызваны напрямую из Client Components без создания API routes.

**Обязательные требования:**
- При создании компонентов следовать [`docs/guidelines/react/ai_component_guidelines.md`](../react/ai_component_guidelines.md)
- При создании utilities следовать [`docs/guidelines/react/ai_react_utilities_guidelines.md`](../react/ai_react_utilities_guidelines.md)
- При работе с БД следовать [`DATABASE_GUIDELINES.md`](./DATABASE_GUIDELINES.md)

---

## I. ОСНОВЫ SERVER ACTIONS

### 1.1. Что такое Server Actions

```typescript
// Server Action - это асинхронная функция с директивой 'use server'
// Выполняется на сервере, может быть вызвана из Client Component

'use server';

export async function createOrder(formData: FormData) {
  // Код выполняется на сервере
  // Имеет доступ к БД, секретам, и т.д.
}
```

### 1.2. Размещение Server Actions

```typescript
// ✅ Правильно - отдельный файл в src/actions/
// src/actions/orders.ts

'use server';

export async function createOrder() { }
export async function updateOrder() { }
export async function deleteOrder() { }

// ❌ Неправильно - в компоненте
// components/OrderForm.tsx
export async function createOrder() { } // НЕ ДЕЛАЙТЕ ТАК!
```

### 1.3. Структура проекта для Server Actions

```
src/
├── actions/                    // ✅ Все Server Actions здесь
│   ├── admin.ts               // Админские действия с заказами
│   ├── orders.ts              // Создание заказов (публичное)
│   ├── services.ts            // Управление услугами
│   ├── reviews.ts             // Управление отзывами
│   ├── gallery.ts             // Управление галереей
│   ├── faq.ts                 // Управление FAQ
│   ├── media.ts               // Управление медиа-файлами
│   ├── pages.ts               // Управление страницами
│   └── settings.ts            // Управление настройками
└── app/
    └── actions/               // ❌ НЕ размещать здесь!
```

---

## II. СТРУКТУРА SERVER ACTION

### 2.1. Полная структура Server Action

```typescript
// ✅ Полный пример Server Action
// src/actions/services.ts

'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

// ==========================================
// 1. ZOD SCHEMAS
// ==========================================

const ServiceSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  slug: z.string().min(2, 'Минимум 2 символа'),
  shortDescription: z.string().min(10, 'Минимум 10 символов'),
  fullDescription: z.string().optional(),
  price: z.string().min(1, 'Цена обязательна'),
  unit: z.string().default('услуга'),
  icon: z.string().optional(),
  image: z.string().optional(),
  active: z.boolean().default(true),
});

// ==========================================
// 2. TYPESCRIPT TYPES
// ==========================================

type ServiceInput = z.infer<typeof ServiceSchema>;

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

// ==========================================
// 3. SERVER ACTION
// ==========================================

/**
 * Создание новой услуги
 * 
 * @param formData - Данные формы
 * @returns Результат операции с ID созданной услуги
 */
export async function createService(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    // 3.1. Проверка аутентификации
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    // 3.2. Извлечение данных из FormData
    const rawData = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      shortDescription: formData.get('shortDescription'),
      fullDescription: formData.get('fullDescription'),
      price: formData.get('price'),
      unit: formData.get('unit'),
      icon: formData.get('icon'),
      image: formData.get('image'),
      active: formData.get('active') === 'true',
    };

    // 3.3. Валидация данных через Zod
    const validatedData = ServiceSchema.parse(rawData);

    // 3.4. Получение следующего order
    const maxOrder = await prisma.service.aggregate({
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order || 0) + 1;

    // 3.5. Создание записи в БД
    const service = await prisma.service.create({
      data: {
        ...validatedData,
        price: parseFloat(validatedData.price),
        order: nextOrder,
      },
    });

    // 3.6. Revalidate paths для обновления кеша
    revalidatePath('/admin/dashboard/services');
    revalidatePath('/'); // Главная страница

    // 3.7. Возврат успешного результата
    return {
      success: true,
      data: { id: service.id },
    };
  } catch (error) {
    // 3.8. Обработка ошибок
    console.error('Error creating service:', error);

    // Zod validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    // Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          success: false,
          error: 'Услуга с таким slug уже существует',
        };
      }
    }

    // Generic error
    return {
      success: false,
      error: 'Ошибка создания услуги',
    };
  }
}
```

### 2.2. Checklist структуры Server Action

- [ ] **Директива 'use server'** в начале файла
- [ ] **Zod schemas** для валидации входных данных
- [ ] **TypeScript типы** выведены из Zod
- [ ] **Discriminated union** для типа результата
- [ ] **JSDoc комментарий** с описанием функции
- [ ] **Проверка аутентификации** (для админских действий)
- [ ] **Валидация данных** через Zod
- [ ] **Бизнес-логика** (Prisma операции)
- [ ] **Revalidate paths** для обновления кеша
- [ ] **Comprehensive error handling** с разными типами ошибок
- [ ] **Console.error** для логирования ошибок

---

## III. АУТЕНТИФИКАЦИЯ В SERVER ACTIONS

### 3.1. Проверка для админских действий

```typescript
'use server';

import { auth } from '@/lib/auth/auth';

export async function adminAction() {
  // Проверка аутентификации
  const session = await auth();
  
  if (!session?.user) {
    return { success: false, error: 'Not authenticated' };
  }
  
  if (session.user.role !== 'ADMIN') {
    return { success: false, error: 'Not authorized' };
  }
  
  // Продолжаем выполнение...
}
```

### 3.2. Публичные Server Actions

```typescript
'use server';

// Для публичных действий (например, создание заказа на landing)
export async function createOrder(formData: FormData) {
  // НЕ требуется проверка аутентификации
  
  // Валидация и создание заказа
  const validatedData = OrderSchema.parse(/* ... */);
  
  const order = await prisma.order.create({
    data: validatedData,
  });
  
  return { success: true, data: { id: order.id } };
}
```

### 3.3. Опциональная аутентификация

```typescript
'use server';

import { auth } from '@/lib/auth/auth';

export async function createOrder(formData: FormData) {
  // Получаем session, но не требуем аутентификацию
  const session = await auth();
  
  const order = await prisma.order.create({
    data: {
      ...validatedData,
      // Привязываем к пользователю, если он авторизован
      userId: session?.user?.id || null,
    },
  });
  
  return { success: true };
}
```

---

## IV. ВАЛИДАЦИЯ ДАННЫХ

### 4.1. Zod schemas

```typescript
// ✅ Правильная валидация через Zod
import { z } from 'zod';

// Базовая схема
const OrderSchema = z.object({
  serviceId: z.string().cuid('Неверный ID услуги'),
  clientName: z.string().min(2, 'Минимум 2 символа'),
  clientPhone: z.string().regex(
    /^\+375\d{9}$/,
    'Формат: +375XXXXXXXXX'
  ),
  clientEmail: z.string().email('Неверный email').optional(),
  comment: z.string().max(500, 'Максимум 500 символов').optional(),
});

// Использование
export async function createOrder(formData: FormData) {
  try {
    const validatedData = OrderSchema.parse({
      serviceId: formData.get('serviceId'),
      clientName: formData.get('clientName'),
      clientPhone: formData.get('clientPhone'),
      clientEmail: formData.get('clientEmail'),
      comment: formData.get('comment'),
    });
    
    // validatedData теперь типизирован и валиден
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Возвращаем первую ошибку валидации
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
  }
}
```

### 4.2. Кастомные валидации

```typescript
// ✅ Кастомная валидация в Zod
const ServiceSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  slug: z.string()
    .min(2, 'Минимум 2 символа')
    .regex(/^[a-z0-9-]+$/, 'Только латиница, цифры и дефисы')
    .refine(async (slug) => {
      // Проверка уникальности slug
      const existing = await prisma.service.findUnique({
        where: { slug },
      });
      return !existing;
    }, 'Slug уже используется'),
});
```

---

## V. РАБОТА С FORMDATA

### 5.1. Извлечение данных из FormData

```typescript
// ✅ Правильное извлечение данных
export async function createService(formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    price: formData.get('price') as string,
    active: formData.get('active') === 'true', // boolean
    image: formData.get('image') as string | null,
  };
  
  // Валидация через Zod
  const validatedData = ServiceSchema.parse(rawData);
}
```

### 5.2. Работа с файлами в FormData

```typescript
// ✅ Обработка файлов
export async function uploadImage(formData: FormData) {
  const file = formData.get('image') as File;
  
  if (!file) {
    return { success: false, error: 'Файл не выбран' };
  }
  
  // Валидация файла
  if (file.size > 5 * 1024 * 1024) { // 5MB
    return { success: false, error: 'Файл слишком большой' };
  }
  
  if (!file.type.startsWith('image/')) {
    return { success: false, error: 'Неверный тип файла' };
  }
  
  // Загрузка в Supabase Storage
  const buffer = Buffer.from(await file.arrayBuffer());
  // ... upload logic
}
```

---

## VI. DISCRIMINATED UNIONS

### 6.1. Типизированные результаты

```typescript
// ✅ Discriminated union для результата
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

// Использование с generic типом
export async function createService(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  // ...
  return { success: true, data: { id: service.id } };
}

export async function deleteService(
  id: string
): Promise<ActionResult> {
  // ...
  return { success: true };
}

// В компоненте
const result = await createService(formData);

if (result.success) {
  // TypeScript знает, что result.data существует
  console.log(result.data.id);
} else {
  // TypeScript знает, что result.error существует
  console.error(result.error);
}
```

### 6.2. Расширенные результаты

```typescript
// ✅ Расширенный discriminated union
type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; code?: string };

export async function updateService(
  id: string,
  formData: FormData
): Promise<ActionResult<{ service: Service }>> {
  try {
    const service = await prisma.service.update({
      where: { id },
      data: validatedData,
    });
    
    return {
      success: true,
      data: { service },
      message: 'Услуга обновлена',
    };
  } catch (error) {
    return {
      success: false,
      error: 'Ошибка обновления',
      code: 'UPDATE_FAILED',
    };
  }
}
```

---

## VII. REVALIDATION

### 7.1. Revalidate Path

```typescript
'use server';

import { revalidatePath } from 'next/cache';

export async function createService(formData: FormData) {
  // Создание услуги
  const service = await prisma.service.create({ data });
  
  // Revalidate конкретного пути
  revalidatePath('/admin/dashboard/services');
  
  // Revalidate главной страницы (где отображаются услуги)
  revalidatePath('/');
  
  return { success: true };
}
```

### 7.2. Revalidate Tag

```typescript
'use server';

import { revalidateTag } from 'next/cache';

// В fetch запросе с тегом
export async function getServices() {
  const response = await fetch('https://api.example.com/services', {
    next: { tags: ['services'] }
  });
  return response.json();
}

// Revalidate по тегу
export async function createService(formData: FormData) {
  const service = await prisma.service.create({ data });
  
  // Invalidate всех fetch запросов с тегом 'services'
  revalidateTag('services');
  
  return { success: true };
}
```

### 7.3. Когда использовать revalidation

```typescript
// ✅ Revalidate когда:
// - Создание новой записи
// - Обновление существующей записи
// - Удаление записи
// - Изменение порядка элементов

export async function reorderServices(
  services: Array<{ id: string; order: number }>
) {
  // Update order
  await Promise.all(
    services.map((service) =>
      prisma.service.update({
        where: { id: service.id },
        data: { order: service.order },
      })
    )
  );
  
  // Revalidate для обновления UI
  revalidatePath('/admin/dashboard/services');
  revalidatePath('/'); // Landing page
  
  return { success: true };
}
```

---

## VIII. ERROR HANDLING

### 8.1. Типы ошибок

```typescript
'use server';

import { z } from 'zod';
import { Prisma } from '@prisma/client';

export async function createService(
  formData: FormData
): Promise<ActionResult> {
  try {
    // ... logic
  } catch (error) {
    console.error('Error creating service:', error);
    
    // 1. Zod validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    
    // 2. Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique constraint violation
      if (error.code === 'P2002') {
        return {
          success: false,
          error: 'Услуга с таким slug уже существует',
        };
      }
      
      // Foreign key constraint violation
      if (error.code === 'P2003') {
        return {
          success: false,
          error: 'Связанная запись не найдена',
        };
      }
    }
    
    // 3. Custom errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return {
        success: false,
        error: 'Нет доступа',
      };
    }
    
    // 4. Generic error
    return {
      success: false,
      error: 'Ошибка создания услуги',
    };
  }
}
```

### 8.2. Логирование ошибок

```typescript
// ✅ Всегда логируйте ошибки для отладки
export async function createService(formData: FormData) {
  try {
    // ... logic
  } catch (error) {
    // Логирование для разработки
    console.error('Error creating service:', error);
    
    // В production можно добавить Sentry
    // Sentry.captureException(error);
    
    return {
      success: false,
      error: 'Ошибка создания услуги',
    };
  }
}
```

---

## IX. OPTIMISTIC UPDATES

### 9.1. Pattern для optimistic updates

```typescript
// ✅ Client Component с optimistic updates
'use client';

import { useState } from 'react';
import { deleteService } from '@/actions/services';
import { toast } from 'sonner';

export const ServicesTable = ({ initialServices }) => {
  const [services, setServices] = useState(initialServices);
  
  const handleDelete = async (id: string) => {
    // 1. Сохраняем удаляемый элемент для rollback
    const serviceToDelete = services.find((s) => s.id === id);
    
    // 2. Optimistic update: удаляем сразу
    setServices((prev) => prev.filter((s) => s.id !== id));
    toast.info('Удаление...');
    
    // 3. Server Action
    const result = await deleteService(id);
    
    if (result.success) {
      toast.success('Услуга удалена');
      router.refresh();
    } else {
      // 4. Rollback при ошибке
      if (serviceToDelete) {
        setServices((prev) => {
          const newServices = [...prev, serviceToDelete];
          return newServices.sort((a, b) => a.order - b.order);
        });
      }
      toast.error(result.error);
    }
  };
  
  return (
    // ... table UI
  );
};
```

---

## X. ИСПОЛЬЗОВАНИЕ В КОМПОНЕНТАХ

### 10.1. В React Hook Form

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createService } from '@/actions/services';

export const ServiceForm = () => {
  const form = useForm({
    resolver: zodResolver(ServiceSchema),
    defaultValues: {
      name: '',
      slug: '',
      price: '',
    },
  });
  
  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('slug', data.slug);
    formData.append('price', data.price);
    
    const result = await createService(formData);
    
    if (result.success) {
      toast.success('Услуга создана');
      router.push('/admin/dashboard/services');
    } else {
      toast.error(result.error);
    }
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Поля формы */}
    </form>
  );
};
```

### 10.2. С form action

```typescript
'use client';

import { createService } from '@/actions/services';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const ServiceForm = () => {
  const router = useRouter();
  
  // Form action
  const handleSubmit = async (formData: FormData) => {
    const result = await createService(formData);
    
    if (result.success) {
      toast.success('Услуга создана');
      router.push('/admin/dashboard/services');
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };
  
  return (
    <form action={handleSubmit}>
      <input type="text" name="name" required />
      <input type="text" name="slug" required />
      <input type="text" name="price" required />
      <button type="submit">Создать</button>
    </form>
  );
};
```

---

## XI. ПРИМЕРЫ SERVER ACTIONS

### 11.1. CRUD операции для Services

```typescript
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

const ServiceSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  shortDescription: z.string().min(10),
  price: z.string().min(1),
  unit: z.string().default('услуга'),
  active: z.boolean().default(true),
});

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

// CREATE
export async function createService(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const validatedData = ServiceSchema.parse({
      name: formData.get('name'),
      slug: formData.get('slug'),
      shortDescription: formData.get('shortDescription'),
      price: formData.get('price'),
      unit: formData.get('unit'),
      active: formData.get('active') === 'true',
    });

    const service = await prisma.service.create({
      data: {
        ...validatedData,
        price: parseFloat(validatedData.price),
        order: await getNextOrder(),
      },
    });

    revalidatePath('/admin/dashboard/services');
    revalidatePath('/');

    return { success: true, data: { id: service.id } };
  } catch (error) {
    console.error('Error creating service:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Ошибка создания услуги' };
  }
}

// UPDATE
export async function updateService(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const validatedData = ServiceSchema.parse({
      name: formData.get('name'),
      slug: formData.get('slug'),
      shortDescription: formData.get('shortDescription'),
      price: formData.get('price'),
      unit: formData.get('unit'),
      active: formData.get('active') === 'true',
    });

    await prisma.service.update({
      where: { id },
      data: {
        ...validatedData,
        price: parseFloat(validatedData.price),
      },
    });

    revalidatePath('/admin/dashboard/services');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error updating service:', error);
    return { success: false, error: 'Ошибка обновления услуги' };
  }
}

// DELETE
export async function deleteService(
  id: string
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.service.delete({
      where: { id },
    });

    revalidatePath('/admin/dashboard/services');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error deleting service:', error);
    return { success: false, error: 'Ошибка удаления услуги' };
  }
}

// REORDER
export async function reorderServices(
  services: Array<{ id: string; order: number }>
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    await Promise.all(
      services.map((service) =>
        prisma.service.update({
          where: { id: service.id },
          data: { order: service.order },
        })
      )
    );

    revalidatePath('/admin/dashboard/services');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error reordering services:', error);
    return { success: false, error: 'Ошибка изменения порядка' };
  }
}

// Helper function
async function getNextOrder(): Promise<number> {
  const maxOrder = await prisma.service.aggregate({
    _max: { order: true },
  });
  return (maxOrder._max.order || 0) + 1;
}
```

---

## XII. CHECKLIST

### 12.1. Checklist для создания Server Action

- [ ] **Файл и структура**
  - [ ] Файл в `src/actions/`
  - [ ] Директива `'use server'` в начале файла
  - [ ] Правильное именование файла (например, `services.ts`)

- [ ] **Типизация**
  - [ ] Zod schema определена
  - [ ] TypeScript типы выведены из Zod (`z.infer`)
  - [ ] Discriminated union для результата
  - [ ] JSDoc комментарий с описанием

- [ ] **Аутентификация**
  - [ ] Проверка аутентификации для админских действий
  - [ ] Проверка роли пользователя
  - [ ] Возврат ошибки при отсутствии доступа

- [ ] **Валидация**
  - [ ] Валидация через Zod schema
  - [ ] Обработка Zod validation errors
  - [ ] Понятные error messages

- [ ] **Бизнес-логика**
  - [ ] Prisma операции
  - [ ] Правильная обработка данных
  - [ ] Transaction при необходимости

- [ ] **Cache management**
  - [ ] `revalidatePath()` для обновления кеша
  - [ ] Revalidate всех релевантных путей

- [ ] **Error handling**
  - [ ] Try-catch блок
  - [ ] `console.error()` для логирования
  - [ ] Обработка разных типов ошибок (Zod, Prisma, Custom)
  - [ ] Понятные error messages для пользователя

- [ ] **Возврат результата**
  - [ ] Discriminated union формат
  - [ ] `{ success: true, data?: T }` при успехе
  - [ ] `{ success: false, error: string }` при ошибке

---

## XIII. СВЯЗАННЫЕ ДОКУМЕНТЫ

- [`docs/guidelines/react/ai_component_guidelines.md`](../react/ai_component_guidelines.md) - Паттерны компонентов
- [`docs/guidelines/react/ai_react_hooks_guidelines.md`](../react/ai_react_hooks_guidelines.md) - Паттерны hooks
- [`DATABASE_GUIDELINES.md`](./DATABASE_GUIDELINES.md) - Работа с Prisma и БД
- [`FORMS_VALIDATION_GUIDELINES.md`](./FORMS_VALIDATION_GUIDELINES.md) - Формы и валидация
- [`AUTH_GUIDELINES.md`](./AUTH_GUIDELINES.md) - Аутентификация

---

**Версия документа:** 1.0  
**Последнее обновление:** 23.11.2025  
**Статус:** ✅ Актуально

