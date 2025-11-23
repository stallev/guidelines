# Архитектурные паттерны проекта

## Версия документа: 1.0
**Дата создания:** 23.11.2025  
**Проект:** Landing Page + Admin Dashboard  
**Назначение:** Руководство по архитектурным решениям и паттернам проекта

---

## 📋 О документе

Этот документ описывает ключевые архитектурные решения, паттерны и best practices, используемые в проекте. Он служит руководством для разработчиков и AI агентов при создании новых features и поддержке существующего кода.

**Обязательные требования:**
- При создании компонентов следовать паттернам из [`docs/guidelines/react/ai_component_guidelines.md`](../react/ai_component_guidelines.md)
- При создании hooks следовать паттернам из [`docs/guidelines/react/ai_react_hooks_guidelines.md`](../react/ai_react_hooks_guidelines.md)
- При создании utilities следовать паттернам из [`docs/guidelines/react/ai_react_utilities_guidelines.md`](../react/ai_react_utilities_guidelines.md)
- При создании таблиц следовать паттернам из [`docs/guidelines/react/ai_responsive_table_guidelines.md`](../react/ai_responsive_table_guidelines.md)

---

## I. ДВУХСЛОЙНАЯ АРХИТЕКТУРА

### 1.1. Концепция

Проект использует двухслойную архитектуру с единой кодовой базой:
- **Public Pages (Landing)** - публичные страницы для посетителей
- **Admin Dashboard** - защищённая админ-панель для управления контентом

### 1.2. Структура App Router

```typescript
src/app/
├── page.tsx                    // Landing page (публичная)
├── layout.tsx                  // Root layout
├── admin/
│   ├── login/
│   │   └── page.tsx           // Страница входа
│   └── dashboard/
│       ├── layout.tsx         // Admin layout (Sidebar + Breadcrumbs)
│       ├── page.tsx           // Dashboard home
│       ├── orders/            // Управление заказами
│       ├── services/          // Управление услугами
│       ├── reviews/           // Управление отзывами
│       ├── gallery/           // Управление галереей
│       ├── faq/               // Управление FAQ
│       ├── media/             // Медиа библиотека
│       ├── pages/             // Управление страницами
│       └── settings/          // Настройки сайта
└── api/
    └── auth/                  // Auth.js routes
```

### 1.3. Преимущества подхода

```typescript
// ✅ Единая кодовая база
// ✅ Переиспользование компонентов
// ✅ Общие utility функции
// ✅ Общая система типов
// ✅ Единая схема БД

// Пример переиспользования компонента
// components/shared/Header.tsx используется и в landing, и в admin
```

---

## II. SERVER-FIRST ARCHITECTURE

### 2.1. React Server Components по умолчанию

```typescript
// ✅ Server Component (по умолчанию)
// app/admin/dashboard/services/page.tsx

import { prisma } from '@/lib/db/prisma';
import { ServicesTable } from '@/components/admin/services-table';

export const dynamic = 'force-dynamic';

const ServicesPage = async () => {
  // Прямой доступ к БД в Server Component
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Управление услугами"
        description="Создание, редактирование и удаление услуг"
        actionButton={{
          href: '/admin/dashboard/services/new',
          label: 'Создать услугу',
        }}
      />
      <ServicesTable initialServices={services} />
    </div>
  );
};

export default ServicesPage;
```

### 2.2. Client Components только для интерактивности

```typescript
// ✅ Client Component (только когда нужна интерактивность)
// components/admin/services-table/ServicesTable.tsx

'use client';

import { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { toast } from 'sonner';

export const ServicesTable = ({ initialServices }) => {
  const [services, setServices] = useState(initialServices);
  
  // Интерактивность: drag & drop, модальные окна, формы
  
  return (
    <DndContext onDragEnd={handleDragEnd}>
      {/* Таблица с drag & drop */}
    </DndContext>
  );
};
```

### 2.3. Когда использовать Client Components

```typescript
// ✅ Используйте 'use client' когда нужно:

// 1. useState, useEffect, useReducer
'use client';
import { useState } from 'react';

// 2. Event handlers (onClick, onChange, и т.д.)
'use client';
const handleClick = () => { /* ... */ };

// 3. Browser APIs (window, document, localStorage)
'use client';
if (typeof window !== 'undefined') { /* ... */ }

// 4. Custom hooks
'use client';
const data = useCustomHook();

// 5. Context Providers
'use client';
<MyContext.Provider value={value}>

// ❌ НЕ используйте 'use client' если:
// - Компонент только отображает данные (статический)
// - Нет интерактивности
// - Нет browser APIs
// - Нет event handlers
```

---

## III. SERVER ACTIONS

### 3.1. Структура Server Actions

```typescript
// ✅ Правильная структура Server Action
// src/actions/services.ts

'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

// 1. Zod schema для валидации
const ServiceSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  slug: z.string().min(2, 'Минимум 2 символа'),
  shortDescription: z.string().min(10, 'Минимум 10 символов'),
  price: z.string().min(1, 'Цена обязательна'),
  unit: z.string().default('услуга'),
  active: z.boolean().default(true),
});

// 2. TypeScript тип из Zod
type ServiceInput = z.infer<typeof ServiceSchema>;

// 3. Discriminated union для результата
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

// 4. Server Action
export async function createService(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    // 4.1. Проверка аутентификации (для админских действий)
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    // 4.2. Валидация входных данных
    const validatedData = ServiceSchema.parse({
      name: formData.get('name'),
      slug: formData.get('slug'),
      shortDescription: formData.get('shortDescription'),
      price: formData.get('price'),
      unit: formData.get('unit'),
      active: formData.get('active') === 'true',
    });

    // 4.3. Бизнес-логика (Prisma операции)
    const service = await prisma.service.create({
      data: {
        ...validatedData,
        price: parseFloat(validatedData.price),
        order: await getNextOrder(),
      },
    });

    // 4.4. Revalidate path для обновления кеша
    revalidatePath('/admin/dashboard/services');
    revalidatePath('/');

    // 4.5. Возврат успешного результата
    return { success: true, data: { id: service.id } };
  } catch (error) {
    // 4.6. Обработка ошибок
    console.error('Error creating service:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors[0].message 
      };
    }
    
    return { 
      success: false, 
      error: 'Ошибка создания услуги' 
    };
  }
}

// Helper функция
async function getNextOrder(): Promise<number> {
  const maxOrder = await prisma.service.aggregate({
    _max: { order: true },
  });
  return (maxOrder._max.order || 0) + 1;
}
```

### 3.2. Использование Server Actions в компонентах

```typescript
// components/admin/ServiceForm.tsx
'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createService } from '@/actions/services';

export const ServiceForm = () => {
  const router = useRouter();
  
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
      {/* Поля формы */}
    </form>
  );
};
```

---

## IV. ТИПОБЕЗОПАСНОСТЬ

### 4.1. Zod Schemas как единый источник истины

```typescript
// ✅ Zod schema определяет структуру данных
// lib/validations/service.ts

import { z } from 'zod';

export const ServiceSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(2, 'Минимум 2 символа'),
  slug: z.string().min(2, 'Минимум 2 символа'),
  shortDescription: z.string().min(10, 'Минимум 10 символов'),
  fullDescription: z.string().optional(),
  price: z.number().positive('Цена должна быть положительной'),
  unit: z.string().default('услуга'),
  icon: z.string().optional(),
  image: z.string().optional(),
  active: z.boolean().default(true),
  order: z.number().int().min(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// TypeScript тип выводится из Zod
export type Service = z.infer<typeof ServiceSchema>;

// Partial для обновления
export type ServiceUpdate = Partial<Service>;

// Для создания (без auto-generated полей)
export const CreateServiceSchema = ServiceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  order: true,
});

export type CreateServiceInput = z.infer<typeof CreateServiceSchema>;
```

### 4.2. Prisma типы и сериализация

```typescript
// ✅ Сериализация Prisma типов для Client Components
// lib/utils/service.ts

import { Service as PrismaService } from '@prisma/client';

// Сериализуемый тип (Decimal → string, Date → string)
export type SerializedService = Omit<PrismaService, 'price' | 'createdAt' | 'updatedAt'> & {
  price: string;
  createdAt: string;
  updatedAt: string;
};

// Функция сериализации
export function serializeService(service: PrismaService): SerializedService {
  return {
    ...service,
    price: service.price.toString(),
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString(),
  };
}

// Функция десериализации
export function deserializeService(service: SerializedService): PrismaService {
  return {
    ...service,
    price: new Decimal(service.price),
    createdAt: new Date(service.createdAt),
    updatedAt: new Date(service.updatedAt),
  };
}
```

### 4.3. Запрет на `any` типы

```typescript
// ❌ Неправильно - использование any
function processData(data: any) {
  return data.map((item: any) => item.value);
}

// ✅ Правильно - явные типы
interface DataItem {
  id: string;
  value: number;
}

function processData(data: DataItem[]): number[] {
  return data.map((item) => item.value);
}

// ✅ Правильно - generic типы
function processData<T extends { value: number }>(data: T[]): number[] {
  return data.map((item) => item.value);
}
```

---

## V. СТРУКТУРА КОМПОНЕНТОВ

### 5.1. Atomic Design иерархия

```typescript
// Следовать паттернам из:
// docs/guidelines/react/ai_component_guidelines.md

components/
├── ui/                         // Atoms (Shadcn UI)
│   ├── button.tsx
│   ├── input.tsx
│   └── dialog.tsx
├── admin/                      // Organisms & Molecules
│   ├── services-table/        // Organism
│   │   ├── ServicesTable.tsx
│   │   ├── components/        // Molecules
│   │   │   ├── ServicesTableDesktop.tsx
│   │   │   └── ServicesTableMobile.tsx
│   │   ├── types.ts
│   │   └── index.ts
│   └── shared/                // Shared components
│       ├── DragHandle.tsx
│       ├── DeleteDialog.tsx
│       └── RowActions.tsx
├── landing/                    // Landing page organisms
│   ├── Hero.tsx
│   ├── Services.tsx
│   └── Contacts.tsx
└── shared/                     // Shared across layers
    ├── Header.tsx
    └── Footer.tsx
```

### 5.2. Организация компонента-таблицы

```typescript
// components/admin/services-table/
// ├── ServicesTable.tsx          // Main component (DndContext)
// ├── components/
// │   ├── ServicesTableDesktop.tsx
// │   ├── ServicesTableMobile.tsx
// │   └── ServicesTableRow.tsx
// ├── types.ts                   // TypeScript types
// └── index.ts                   // Public exports

// types.ts
export interface Service {
  id: string;
  name: string;
  price: string;
  active: boolean;
  order: number;
}

export interface ServicesTableProps {
  initialServices: Service[];
}

// index.ts
export { ServicesTable } from './ServicesTable';
export type { ServicesTableProps, Service } from './types';
```

---

## VI. STATE MANAGEMENT

### 6.1. Минимальное использование Zustand

```typescript
// ✅ Используйте Server Components вместо клиентского state
// Zustand только когда действительно нужно глобальное состояние

// store/modalStore.ts
import { create } from 'zustand';

interface ModalState {
  modals: Record<string, boolean>;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  modals: {},
  openModal: (modalId) =>
    set((state) => ({
      modals: { ...state.modals, [modalId]: true },
    })),
  closeModal: (modalId) =>
    set((state) => ({
      modals: { ...state.modals, [modalId]: false },
    })),
}));

// Использование
'use client';
import { useModalStore } from '@/store/modalStore';

const Component = () => {
  const { openModal, closeModal } = useModalStore();
  
  return (
    <button onClick={() => openModal('service-modal')}>
      Открыть модальное окно
    </button>
  );
};
```

### 6.2. Local state для UI состояния

```typescript
// ✅ useState для локального UI состояния
'use client';
import { useState } from 'react';

export const ServicesTable = ({ initialServices }) => {
  // Локальное состояние для optimistic updates
  const [services, setServices] = useState(initialServices);
  const [isReordering, setIsReordering] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  return (
    // ...
  );
};
```

---

## VII. ERROR HANDLING

### 7.1. Error Boundaries

```typescript
// ✅ Error Boundary для обработки ошибок
// app/error.tsx

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          Что-то пошло не так!
        </h2>
        <p className="text-gray-600 mb-6">
          Произошла ошибка при загрузке страницы.
        </p>
        <Button onClick={reset}>Попробовать снова</Button>
      </div>
    </div>
  );
}
```

### 7.2. Try-Catch в Server Actions

```typescript
// ✅ Comprehensive error handling
export async function createService(
  formData: FormData
): Promise<ActionResult> {
  try {
    // Валидация
    const data = ServiceSchema.parse(/* ... */);
    
    // Бизнес-логика
    const service = await prisma.service.create({ data });
    
    return { success: true, data: { id: service.id } };
  } catch (error) {
    // Логирование для отладки
    console.error('Error creating service:', error);
    
    // Zod validation errors
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors[0].message 
      };
    }
    
    // Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { success: false, error: 'Такая услуга уже существует' };
      }
    }
    
    // Generic error
    return { success: false, error: 'Ошибка создания услуги' };
  }
}
```

---

## VIII. PERFORMANCE OPTIMIZATION

### 8.1. React Compiler optimization

```typescript
// ✅ React Compiler автоматически оптимизирует
// Не нужны useMemo, useCallback для простых случаев

// next.config.ts
const nextConfig = {
  experimental: {
    reactCompiler: true, // ✅ Включен React Compiler
  },
};

// Компонент автоматически оптимизируется
export const ServiceCard = ({ service }) => {
  // Автоматическая мемоизация
  const displayPrice = `${service.price} ₽`;
  
  return (
    <div>
      <h3>{service.name}</h3>
      <p>{displayPrice}</p>
    </div>
  );
};
```

### 8.2. Dynamic imports для больших компонентов

```typescript
// ✅ Dynamic import для модальных окон
import dynamic from 'next/dynamic';

const OrderModal = dynamic(
  () => import('@/components/landing/OrderModal'),
  {
    loading: () => <Skeleton className="h-96" />,
    ssr: false, // Не рендерить на сервере
  }
);

export const Services = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        Заказать услугу
      </Button>
      {isModalOpen && <OrderModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
};
```

---

## IX. CACHING STRATEGIES

### 9.1. Next.js caching

```typescript
// ✅ ISR (Incremental Static Regeneration)
// app/page.tsx

export const revalidate = 3600; // Revalidate каждый час

export default async function HomePage() {
  const services = await prisma.service.findMany({
    where: { active: true },
  });
  
  return <HomePage services={services} />;
}

// ✅ Force dynamic для админ-панели
// app/admin/dashboard/services/page.tsx

export const dynamic = 'force-dynamic'; // Всегда dynamic

export default async function ServicesPage() {
  // Всегда свежие данные
  const services = await prisma.service.findMany();
  
  return <ServicesTable services={services} />;
}
```

### 9.2. React cache для дедупликации

```typescript
// ✅ React cache для дедупликации запросов
// lib/db/queries/services.ts

import { cache } from 'react';
import { prisma } from '@/lib/db/prisma';

export const getServiceBySlug = cache(async (slug: string) => {
  return await prisma.service.findUnique({
    where: { slug },
  });
});

// Использование - запрос выполнится только один раз
// даже если вызывается несколько раз в одном render

async function ServicePage({ slug }) {
  const service = await getServiceBySlug(slug); // Первый вызов
  const sameService = await getServiceBySlug(slug); // Кеш!
  
  return <div>{service.name}</div>;
}
```

---

## X. CHECKLIST

### 10.1. Архитектурный checklist для новых features

- [ ] **Структура компонентов**
  - [ ] Следует Atomic Design иерархии
  - [ ] Компоненты в правильных папках (landing/admin/shared)
  - [ ] Используются паттерны из [`ai_component_guidelines.md`](../react/ai_component_guidelines.md)

- [ ] **Server/Client split**
  - [ ] Server Components по умолчанию
  - [ ] 'use client' только когда нужна интерактивность
  - [ ] Правильная сериализация props для Client Components

- [ ] **Server Actions**
  - [ ] Используют 'use server' директиву
  - [ ] Валидация через Zod schemas
  - [ ] Проверка аутентификации для админских действий
  - [ ] Discriminated union для результата
  - [ ] Comprehensive error handling

- [ ] **Типобезопасность**
  - [ ] Zod schemas определены
  - [ ] TypeScript типы выведены из Zod
  - [ ] Нет использования `any` типов
  - [ ] Prisma типы правильно сериализованы

- [ ] **State Management**
  - [ ] Минимальное использование клиентского state
  - [ ] Zustand только для глобального состояния
  - [ ] useState для локального UI состояния

- [ ] **Error Handling**
  - [ ] Error Boundaries для UI ошибок
  - [ ] Try-Catch в Server Actions
  - [ ] Понятные error messages для пользователя

- [ ] **Performance**
  - [ ] React Compiler optimization включен
  - [ ] Dynamic imports для больших компонентов
  - [ ] Правильная caching strategy

- [ ] **Code Quality**
  - [ ] ESLint warnings устранены
  - [ ] TypeScript errors устранены
  - [ ] Проект собирается без ошибок (`npm run build`)

---

## XI. СВЯЗАННЫЕ ДОКУМЕНТЫ

- [`docs/guidelines/react/ai_component_guidelines.md`](../react/ai_component_guidelines.md) - Паттерны React компонентов
- [`docs/guidelines/react/ai_react_hooks_guidelines.md`](../react/ai_react_hooks_guidelines.md) - Паттерны React hooks
- [`docs/guidelines/react/ai_react_utilities_guidelines.md`](../react/ai_react_utilities_guidelines.md) - Паттерны utility функций
- [`docs/guidelines/react/ai_responsive_table_guidelines.md`](../react/ai_responsive_table_guidelines.md) - Паттерны адаптивных таблиц
- [`docs/prds/ARCHITECTURE.md`](../../prds/ARCHITECTURE.md) - Общая архитектура проекта
- [`docs/prds/MVP_SCOPE.md`](../../prds/MVP_SCOPE.md) - MVP scope и ограничения

---

**Версия документа:** 1.0  
**Последнее обновление:** 23.11.2025  
**Статус:** ✅ Актуально

