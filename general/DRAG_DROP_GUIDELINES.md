# Drag & Drop Guidelines

## Версия документа: 1.0
**Дата создания:** 23.11.2025  
**Проект:** Landing Page + Admin Dashboard  
**Назначение:** Руководство по реализации drag & drop в таблицах админ-панели

---

## 📋 О документе

Этот документ описывает реализацию drag & drop функциональности для изменения порядка элементов в таблицах админ-панели с использованием `@dnd-kit`.

**Базовая реализация:** `src/components/admin/services-table/ServicesTable.tsx`

**Обязательные требования:**
- При создании компонентов следовать [`docs/guidelines/react/ai_component_guidelines.md`](../react/ai_component_guidelines.md)
- При создании таблиц следовать [`docs/guidelines/react/ai_responsive_table_guidelines.md`](../react/ai_responsive_table_guidelines.md)
- При работе с Server Actions следовать [`SERVER_ACTIONS_GUIDELINES.md`](./SERVER_ACTIONS_GUIDELINES.md)

---

## I. УСТАНОВКА БИБЛИОТЕК

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

```json
// package.json
{
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2"
  }
}
```

---

## II. СТРУКТУРА КОМПОНЕНТА

### 2.1. Main Table Component (DndContext)

```typescript
// components/admin/services-table/ServicesTable.tsx
'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState } from 'react';
import { toast } from 'sonner';
import { reorderServices } from '@/actions/services';
import { ReorderingOverlay } from '@/components/admin/shared';

export const ServicesTable = ({ initialServices }) => {
  const [services, setServices] = useState(initialServices);
  const [isReordering, setIsReordering] = useState(false);

  // 1. Configure sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Минимальная дистанция для активации (улучшает UX на mobile)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 2. Service IDs для SortableContext
  const serviceIds = services.map((service) => service.id);

  // 3. Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = services.findIndex((s) => s.id === active.id);
    const newIndex = services.findIndex((s) => s.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Optimistic update
    const newServices = arrayMove(services, oldIndex, newIndex);
    const reorderedServices = newServices.map((service, index) => ({
      ...service,
      order: index,
    }));

    setServices(reorderedServices);
    setIsReordering(true);

    try {
      const result = await reorderServices(
        reorderedServices.map((s) => ({ id: s.id, order: s.order }))
      );

      if (result.success) {
        toast.success('Порядок услуг обновлен');
        router.refresh();
      } else {
        // Rollback on error
        setServices(initialServices);
        toast.error(result.error || 'Ошибка обновления порядка');
      }
    } catch {
      setServices(initialServices);
      toast.error('Ошибка обновления порядка');
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <ServicesTableDesktop
        services={services}
        serviceIds={serviceIds}
      />
      <ServicesTableMobile
        services={services}
        serviceIds={serviceIds}
      />
      <ReorderingOverlay 
        isReordering={isReordering}
        message="Обновление порядка..."
      />
    </DndContext>
  );
};
```

### 2.2. Desktop Table Component

```typescript
// components/admin/services-table/components/ServicesTableDesktop.tsx
'use client';

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Table, TableHeader, TableBody, TableRow, TableHead } from '@/components/ui/table';
import { ServicesTableRowDesktop } from './ServicesTableRowDesktop';

export const ServicesTableDesktop = ({ services, serviceIds }) => {
  return (
    <div className="hidden xl:block"> {/* Desktop only: >= 1280px */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-5"></TableHead> {/* Handle */}
            <TableHead className="w-12">№</TableHead>
            <TableHead>Название</TableHead>
            <TableHead>Описание</TableHead>
            <TableHead className="w-32">Цена</TableHead>
            <TableHead className="w-24">Активна</TableHead>
            <TableHead className="w-24 text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <SortableContext items={serviceIds} strategy={verticalListSortingStrategy}>
            {services.map((service, index) => (
              <ServicesTableRowDesktop
                key={service.id}
                service={service}
                index={index}
              />
            ))}
          </SortableContext>
        </TableBody>
      </Table>
    </div>
  );
};
```

### 2.3. Sortable Row Component

```typescript
// components/admin/services-table/components/ServicesTableRowDesktop.tsx
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TableCell, TableRow } from '@/components/ui/table';
import { DragHandle } from '@/components/admin/shared';

export const ServicesTableRowDesktop = ({ service, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'bg-muted' : ''}
    >
      <TableCell className="w-5">
        <DragHandle
          attributes={attributes}
          listeners={listeners}
          isDragging={isDragging}
        />
      </TableCell>
      <TableCell>{index + 1}</TableCell>
      <TableCell>{service.name}</TableCell>
      <TableCell>{service.shortDescription}</TableCell>
      <TableCell>{service.price} ₽</TableCell>
      <TableCell>{service.active ? 'Да' : 'Нет'}</TableCell>
      <TableCell className="text-right">
        {/* Actions */}
      </TableCell>
    </TableRow>
  );
};
```

---

## III. SHARED COMPONENTS

### 3.1. DragHandle Component

```typescript
// components/admin/shared/DragHandle.tsx
'use client';

import { GripVertical } from 'lucide-react';
import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core';

interface DragHandleProps {
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
  isDragging?: boolean;
  ariaLabel?: string;
}

export const DragHandle = ({
  attributes,
  listeners,
  isDragging,
  ariaLabel = 'Переместить элемент',
}: DragHandleProps) => {
  return (
    <button
      className={`
        cursor-grab active:cursor-grabbing
        text-gray-400 hover:text-gray-600
        ${isDragging ? 'cursor-grabbing' : ''}
      `}
      aria-label={ariaLabel}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-5 w-5" />
    </button>
  );
};
```

### 3.2. ReorderingOverlay Component

```typescript
// components/admin/shared/ReorderingOverlay.tsx
'use client';

import { Loader2 } from 'lucide-react';

interface ReorderingOverlayProps {
  isReordering: boolean;
  message?: string;
  ariaLabel?: string;
}

export const ReorderingOverlay = ({
  isReordering,
  message = 'Обновление порядка...',
  ariaLabel = 'Обновление порядка элементов',
}: ReorderingOverlayProps) => {
  if (!isReordering) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      aria-label={ariaLabel}
      role="status"
      aria-live="polite"
    >
      <div className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};
```

---

## IV. SERVER ACTION

```typescript
// actions/services.ts
'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { revalidatePath } from 'next/cache';

const ReorderSchema = z.array(
  z.object({
    id: z.string().cuid(),
    order: z.number().int().min(0),
  })
);

export async function reorderServices(services: Array<{ id: string; order: number }>) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate
    const validatedServices = ReorderSchema.parse(services);

    // Update order for each service
    await Promise.all(
      validatedServices.map((service) =>
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
    console.error('Reorder error:', error);
    return { success: false, error: 'Ошибка изменения порядка' };
  }
}
```

---

## V. MOBILE SUPPORT

### 5.1. Touch Support

```typescript
// ✅ PointerSensor с activationConstraint для mobile
useSensor(PointerSensor, {
  activationConstraint: {
    distance: 8, // Минимальная дистанция для активации
  },
})
```

### 5.2. Mobile Table с Drag & Drop

```typescript
// components/admin/services-table/components/ServicesTableMobile.tsx
'use client';

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export const ServicesTableMobile = ({ services, serviceIds }) => {
  return (
    <div className="block xl:hidden"> {/* Mobile: < 1280px */}
      <SortableContext items={serviceIds} strategy={verticalListSortingStrategy}>
        {services.map((service, index) => (
          <ServicesTableRowMobile
            key={service.id}
            service={service}
            index={index}
          />
        ))}
      </SortableContext>
    </div>
  );
};
```

---

## VI. OPTIMISTIC UPDATES

### 6.1. Pattern для optimistic updates

```typescript
// 1. Сохраняем initial data для rollback
const [services, setServices] = useState(initialServices);

// 2. Optimistic update
const newServices = arrayMove(services, oldIndex, newIndex);
setServices(newServices);

// 3. Server Action
const result = await reorderServices(newServices);

if (result.success) {
  // Success
  toast.success('Порядок обновлен');
} else {
  // 4. Rollback on error
  setServices(initialServices);
  toast.error(result.error);
}
```

---

## VII. ACCESSIBILITY

### 7.1. Keyboard Navigation

```typescript
// ✅ KeyboardSensor для keyboard navigation
useSensor(KeyboardSensor, {
  coordinateGetter: sortableKeyboardCoordinates,
})

// Keyboard shortcuts:
// - Space: Pick up / Drop
// - Arrow keys: Move
// - Escape: Cancel
```

### 7.2. ARIA Attributes

```typescript
// ✅ ARIA attributes для screen readers
<button
  aria-label="Переместить элемент"
  {...attributes}
  {...listeners}
>
  <GripVertical />
</button>

<div
  role="status"
  aria-live="polite"
  aria-label="Обновление порядка элементов"
>
  Обновление порядка...
</div>
```

---

## VIII. CHECKLIST

### 8.1. Checklist для drag & drop

- [ ] **Библиотеки**
  - [ ] @dnd-kit/core установлен
  - [ ] @dnd-kit/sortable установлен
  - [ ] @dnd-kit/utilities установлен

- [ ] **Структура**
  - [ ] DndContext обёртывает таблицу
  - [ ] SortableContext с items
  - [ ] useSortable в row компоненте
  - [ ] Sensors настроены (Pointer + Keyboard)

- [ ] **Shared Components**
  - [ ] DragHandle используется
  - [ ] ReorderingOverlay добавлен
  - [ ] Компоненты из @/components/admin/shared

- [ ] **Server Action**
  - [ ] reorder Server Action создан
  - [ ] Валидация через Zod
  - [ ] Проверка аутентификации
  - [ ] Revalidate paths

- [ ] **UX**
  - [ ] Optimistic updates реализованы
  - [ ] Rollback при ошибке
  - [ ] Toast notifications
  - [ ] Loading overlay при сохранении
  - [ ] Visual feedback (opacity при dragging)

- [ ] **Mobile**
  - [ ] Touch support (PointerSensor с activationConstraint)
  - [ ] Работает на мобильных устройствах
  - [ ] Адаптивный UI (hidden xl:block / block xl:hidden)

- [ ] **Accessibility**
  - [ ] Keyboard navigation поддерживается
  - [ ] ARIA labels настроены
  - [ ] Screen reader friendly

---

## IX. СВЯЗАННЫЕ ДОКУМЕНТЫ

- [`docs/guidelines/react/ai_component_guidelines.md`](../react/ai_component_guidelines.md) - Паттерны компонентов
- [`docs/guidelines/react/ai_responsive_table_guidelines.md`](../react/ai_responsive_table_guidelines.md) - Адаптивные таблицы
- [`docs/guidelines/react/ai_drag_drop_guidelines.md`](../react/ai_drag_drop_guidelines.md) - Drag & Drop подробно
- [`SERVER_ACTIONS_GUIDELINES.md`](./SERVER_ACTIONS_GUIDELINES.md) - Server Actions
- [@dnd-kit Documentation](https://docs.dndkit.com/) - Официальная документация

---

**Версия документа:** 1.0  
**Последнее обновление:** 23.11.2025  
**Статус:** ✅ Актуально

