# Guidelines для типовых компонентов страниц админ-панели

Этот документ определяет стандарты и требования для типовых компонентов, используемых на страницах админ-панели проекта.

**Версия документа**: 1.0  
**Дата создания**: 06.11.2025  
**Применимость**: Все страницы админ-панели

---

## 1. PageHeader - Заголовок страницы

### 1.1. Назначение
Компонент `PageHeader` используется для отображения заголовка страницы, описания и кнопки действия на всех страницах админ-панели.

### 1.2. Структура компонента
```tsx
<PageHeader
  title="Название страницы"
  description="Описание страницы"
  actionButton={{
    href: '/admin/dashboard/path/new',
    label: 'Создать элемент',
    icon: <Plus className="h-4 w-4 mr-2" />,
  }}
/>
```

### 1.3. Адаптивность

#### Десктопная версия (≥ 768px)
- Элементы располагаются в строку (`flex-row`)
- Заголовок и описание слева
- Кнопка действия справа
- Выравнивание: `items-center justify-between`

#### Мобильная версия (< 768px)
- Элементы располагаются в колонку (`flex-col`)
- Заголовок и описание сверху
- Кнопка действия снизу, на всю ширину (`w-full`)
- Отступы между элементами: `gap-4`

### 1.4. Стилизация

**Заголовок:**
- Размер: `text-3xl`
- Начертание: `font-bold`
- Цвет: наследуется от темы

**Описание:**
- Размер: стандартный
- Цвет: `text-gray-600` или `text-muted-foreground`
- Отступ сверху: `mt-2`

**Кнопка действия:**
- На десктопе: автоматическая ширина (`w-auto`)
- На мобильных: полная ширина (`w-full`)
- Иконка: `h-4 w-4`, отступ справа `mr-2`

### 1.5. Пример использования

```tsx
import { PageHeader } from '@/components/admin/PageHeader';
import { Plus } from 'lucide-react';

const ServicesPage = async () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Управление услугами"
        description="Создание, редактирование и удаление услуг"
        actionButton={{
          href: '/admin/dashboard/services/new',
          label: 'Создать услугу',
          icon: <Plus className="h-4 w-4 mr-2" />,
        }}
      />
      {/* Остальной контент */}
    </div>
  );
};
```

### 1.6. Страницы без кнопки действия
Если страница не требует кнопки действия, параметр `actionButton` можно не передавать:

```tsx
<PageHeader
  title="Управление заказами"
  description="Просмотр и управление заказами клиентов"
/>
```

---

## 2. Применение на страницах админ-панели

### 2.1. Обязательное использование
Компонент `PageHeader` должен использоваться на всех страницах админ-панели, которые имеют:
- Заголовок страницы
- Описание страницы
- Опциональную кнопку действия

### 2.2. Страницы, использующие PageHeader

#### Страницы с кнопкой действия:
- `/admin/dashboard/services` - Управление услугами
- `/admin/dashboard/gallery` - Управление галереей
- `/admin/dashboard/pages` - Страницы сайта
- `/admin/dashboard/faq` - Управление FAQ
- `/admin/dashboard/reviews` - Модерация отзывов

#### Страницы без кнопки действия:
- `/admin/dashboard/orders` - Управление заказами

### 2.3. Исключения
Страницы, которые НЕ используют `PageHeader`:
- `/admin/dashboard` - Главная страница админ-панели (имеет другую структуру)
- Страницы редактирования/создания используют `FormPageHeader` (см. раздел 2)

---

## 2. FormPageHeader - Заголовок страницы создания/редактирования

### 2.1. Назначение
Компонент `FormPageHeader` используется для отображения заголовка страницы, описания и кнопки "Назад" на всех страницах создания и редактирования в админ-панели.

### 2.2. Структура компонента
```tsx
<FormPageHeader
  title="Создание услуги"
  description="Заполните форму для создания новой услуги"
  backHref="/admin/dashboard/services"
  backLabel="Назад" // опционально, по умолчанию "Назад"
/>
```

### 2.3. Адаптивность

#### Все экраны
- Элементы всегда располагаются в колонку (`flex-col`)
- Кнопка "Назад" сверху
- Заголовок и описание снизу
- Отступы между элементами: `gap-4`

**Важно**: В отличие от `PageHeader`, `FormPageHeader` всегда использует вертикальное расположение для лучшей читаемости и консистентности на всех устройствах.

### 2.4. Стилизация

**Кнопка "Назад":**
- Вариант: `variant="ghost"`
- **Обязательный border**: `border border-border/50` - слабый border для идентификации как управляющего элемента
- Hover эффект: `hover:border-border hover:bg-accent`
- Ширина: `w-fit` (по содержимому)
- Иконка: `ArrowLeft`, размер `h-4 w-4`, отступ справа `mr-2`

**Заголовок:**
- Размер: `text-3xl`
- Начертание: `font-bold`
- Цвет: наследуется от темы

**Описание:**
- Размер: стандартный
- Цвет: `text-gray-600`
- Отступ сверху: `mt-2`

### 2.5. Пример использования

```tsx
import { FormPageHeader } from '@/components/admin/FormPageHeader';
import { ServiceForm } from '@/components/admin/ServiceForm';

const NewServicePage = () => {
  return (
    <div className="space-y-6">
      <FormPageHeader
        title="Создание услуги"
        description="Заполните форму для создания новой услуги"
        backHref="/admin/dashboard/services"
      />

      <ServiceForm />
    </div>
  );
};
```

### 2.6. Страницы, использующие FormPageHeader

#### Страницы создания:
- `/admin/dashboard/services/new` - Создание услуги
- `/admin/dashboard/gallery/new` - Создание элемента галереи
- `/admin/dashboard/pages/new` - Создание страницы
- `/admin/dashboard/faq/new` - Создание вопроса
- `/admin/dashboard/reviews/new` - Создание отзыва

#### Страницы редактирования:
- `/admin/dashboard/services/[id]/edit` - Редактирование услуги
- `/admin/dashboard/gallery/[id]/edit` - Редактирование элемента галереи
- `/admin/dashboard/faq/[id]/edit` - Редактирование вопроса

---

## 3. Применение на страницах админ-панели

## 4. Брейкпоинты

### 4.1. Единый брейкпоинт для PageHeader
- **Мобильная версия**: < 768px (`md:`)
- **Десктопная версия**: ≥ 768px (`md:` и выше)

**Примечание**: Брейкпоинт для `PageHeader` (768px) отличается от брейкпоинта для таблиц (1280px), так как заголовок страницы требует адаптивности на более раннем этапе.

### 4.2. FormPageHeader
- **Все экраны**: Компонент всегда использует вертикальное расположение (`flex-col`)
- Не требует брейкпоинтов, так как структура одинакова на всех устройствах

### 4.3. Использование в коде
```tsx
// PageHeader - адаптивный
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  {/* Контент */}
</div>

// FormPageHeader - всегда колонка
<div className="flex flex-col gap-4">
  {/* Контент */}
</div>
```

---

## 5. Чеклист реализации

При создании или обновлении страницы админ-панели:

### 5.1. PageHeader (для страниц списков)
- [ ] Используется компонент `PageHeader` из `@/components/admin/PageHeader`
- [ ] Заголовок и описание переданы корректно
- [ ] Кнопка действия (если нужна) передана с правильными параметрами
- [ ] На мобильных (< 768px) элементы располагаются в колонку
- [ ] На десктопе (≥ 768px) элементы располагаются в строку
- [ ] Кнопка действия на мобильных имеет `w-full`

### 5.2. FormPageHeader (для страниц создания/редактирования)
- [ ] Используется компонент `FormPageHeader` из `@/components/admin/FormPageHeader`
- [ ] Заголовок и описание переданы корректно
- [ ] `backHref` указывает на страницу списка соответствующего раздела
- [ ] Кнопка "Назад" имеет слабый border (`border border-border/50`)
- [ ] Элементы всегда располагаются в колонку (на всех экранах)
- [ ] Кнопка "Назад" расположена сверху, заголовок снизу

### 5.3. Общая структура страницы
- [ ] Используется `space-y-6` для отступов между секциями
- [ ] Контент обернут в `<div className="space-y-6">`
- [ ] Страница имеет правильный `export const dynamic = 'force-dynamic'`

---

## 6. Примеры полной реализации

### 6.1. Страница с таблицей и кнопкой действия

```tsx
import { Suspense } from 'react';
import { PageHeader } from '@/components/admin/PageHeader';
import { ServicesTable } from '@/components/admin/ServicesTable';
import { ServicesTableSkeleton } from '@/components/admin/ServicesTableSkeleton';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

const ServicesPage = async () => {
  // Получение данных...

  return (
    <div className="space-y-6">
      <PageHeader
        title="Управление услугами"
        description="Создание, редактирование и удаление услуг"
        actionButton={{
          href: '/admin/dashboard/services/new',
          label: 'Создать услугу',
          icon: <Plus className="h-4 w-4 mr-2" />,
        }}
      />

      <Suspense fallback={<ServicesTableSkeleton />}>
        <ServicesTable initialServices={services} />
      </Suspense>
    </div>
  );
};

export default ServicesPage;
```

### 6.2. Страница без кнопки действия

```tsx
import { Suspense } from 'react';
import { PageHeader } from '@/components/admin/PageHeader';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { OrdersTableSkeleton } from '@/components/admin/OrdersTableSkeleton';

export const dynamic = 'force-dynamic';

const OrdersPage = async () => {
  // Получение данных...

  return (
    <div className="space-y-6">
      <PageHeader
        title="Управление заказами"
        description="Просмотр и управление заказами клиентов"
      />

      <Suspense fallback={<OrdersTableSkeleton />}>
        <OrdersTable initialOrders={orders} />
      </Suspense>
    </div>
  );
};

export default OrdersPage;
```

### 6.3. Страница создания/редактирования

```tsx
import { FormPageHeader } from '@/components/admin/FormPageHeader';
import { ServiceForm } from '@/components/admin/ServiceForm';

export const dynamic = 'force-dynamic';

const NewServicePage = () => {
  return (
    <div className="space-y-6">
      <FormPageHeader
        title="Создание услуги"
        description="Заполните форму для создания новой услуги"
        backHref="/admin/dashboard/services"
      />

      <ServiceForm />
    </div>
  );
};

export default NewServicePage;
```

### 6.4. Страница редактирования

```tsx
import { notFound } from 'next/navigation';
import { FormPageHeader } from '@/components/admin/FormPageHeader';
import { ServiceForm } from '@/components/admin/ServiceForm';
import { prisma } from '@/lib/db/prisma';
import { serializeService } from '@/lib/utils/service';

export const dynamic = 'force-dynamic';

const EditServicePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });

  if (!service) {
    notFound();
  }

  const serializedService = serializeService(service);

  return (
    <div className="space-y-6">
      <FormPageHeader
        title="Редактирование услуги"
        description="Измените данные услуги"
        backHref="/admin/dashboard/services"
      />

      <ServiceForm service={serializedService} />
    </div>
  );
};

export default EditServicePage;
```

---

## 7. Итоговые рекомендации

### 7.1. PageHeader (страницы списков)
1. ✅ **Всегда используйте `PageHeader`** для страниц админ-панели с заголовком
2. ✅ **Брейкпоинт 768px** для адаптивности заголовка страницы
3. ✅ **Колонка на мобильных** (< 768px) для лучшей читаемости
4. ✅ **Строка на десктопе** (≥ 768px) для эффективного использования пространства
5. ✅ **Кнопка действия на всю ширину** на мобильных устройствах

### 7.2. FormPageHeader (страницы создания/редактирования)
1. ✅ **Всегда используйте `FormPageHeader`** для страниц создания и редактирования
2. ✅ **Вертикальное расположение** на всех экранах для консистентности
3. ✅ **Кнопка "Назад" с border** для идентификации как управляющего элемента
4. ✅ **Кнопка "Назад" сверху**, заголовок снизу
5. ✅ **Правильный `backHref`** - должен указывать на страницу списка раздела

### 7.3. Общие принципы
1. ✅ **Консистентность** - одинаковый стиль на всех страницах
2. ✅ **Адаптивность** - корректное отображение на всех устройствах
3. ✅ **Доступность** - правильная семантика и ARIA атрибуты

---

## 8. Переиспользуемые компоненты таблиц (Shared Components)

### 8.1. Назначение

Компоненты из каталога `@/components/admin/shared` предназначены для использования во всех таблицах админ-панели. Они обеспечивают консистентный UX и уменьшают дублирование кода.

### 8.2. Доступные компоненты

#### 8.2.1. DragHandle - Handle для drag & drop

**Назначение**: Визуальный handle для перетаскивания строк таблицы.

**Импорт**:
```tsx
import { DragHandle } from '@/components/admin/shared';
```

**Использование**:
```tsx
<DragHandle
  attributes={attributes}
  listeners={listeners}
  isDragging={isDragging}
  ariaLabel="Переместить элемент" // опционально
/>
```

**Пропсы**:
- `attributes: DraggableAttributes` - атрибуты из `useSortable`
- `listeners: DraggableSyntheticListeners` - слушатели из `useSortable`
- `isDragging?: boolean` - флаг перетаскивания
- `ariaLabel?: string` - ARIA label (по умолчанию "Переместить элемент")

**Применение**: Используется во всех таблицах с drag & drop (Services, Gallery, FAQ).

---

#### 8.2.2. DeleteDialog - Диалог подтверждения удаления

**Назначение**: Универсальный диалог подтверждения удаления элемента.

**Импорт**:
```tsx
import { DeleteDialog } from '@/components/admin/shared';
```

**Использование**:
```tsx
<DeleteDialog
  itemId={deletingId}
  itemName={item.name}
  isOpen={!!deletingId}
  isDeleting={isDeleting}
  onClose={handleClose}
  onConfirm={handleConfirm}
  title="Удалить элемент?" // опционально
  description={<>Кастомное описание</>} // опционально
/>
```

**Пропсы**:
- `itemId: string | null` - ID элемента для удаления
- `itemName: string` - Название элемента
- `isOpen: boolean` - Открыт ли диалог
- `isDeleting: boolean` - Идет ли процесс удаления
- `onClose: () => void` - Обработчик закрытия
- `onConfirm: () => Promise<void>` - Обработчик подтверждения
- `title?: string` - Заголовок диалога (по умолчанию "Удалить элемент?")
- `description?: React.ReactNode` - Описание (по умолчанию стандартное)

**Применение**: Используется во всех таблицах с функцией удаления.

---

#### 8.2.3. RowActions - Кнопки действий строки

**Назначение**: Кнопки редактирования и удаления для строки таблицы.

**Импорт**:
```tsx
import { RowActions } from '@/components/admin/shared';
```

**Использование**:
```tsx
<RowActions
  itemId={item.id}
  editHref={`/admin/dashboard/items/${item.id}/edit`}
  onDeleteClick={handleDeleteClick}
  isDeleting={isDeleting}
  ariaLabel="Действия с элементом" // опционально
/>
```

**Пропсы**:
- `itemId: string` - ID элемента
- `editHref: string` - URL страницы редактирования
- `onDeleteClick: () => void` - Обработчик клика на удаление
- `isDeleting?: boolean` - Идет ли процесс удаления
- `ariaLabel?: string` - ARIA label (по умолчанию "Действия с элементом")

**Применение**: Используется во всех таблицах с функциями редактирования и удаления.

---

#### 8.2.4. TableEmptyState - Пустое состояние таблицы

**Назначение**: Отображение сообщения, когда таблица пуста.

**Импорт**:
```tsx
import { TableEmptyState } from '@/components/admin/shared';
```

**Использование**:
```tsx
<TableEmptyState 
  colSpan={8} 
  message="Элементы не найдены" // опционально
/>
```

**Пропсы**:
- `colSpan: number` - Количество колонок для объединения
- `message?: string` - Сообщение (по умолчанию "Элементы не найдены")

**Применение**: Используется во всех таблицах для отображения пустого состояния.

---

#### 8.2.5. ReorderingOverlay - Overlay при переупорядочивании

**Назначение**: Индикатор загрузки при переупорядочивании элементов через drag & drop.

**Импорт**:
```tsx
import { ReorderingOverlay } from '@/components/admin/shared';
```

**Использование**:
```tsx
<ReorderingOverlay
  isReordering={isReordering}
  message="Обновление порядка..." // опционально
  ariaLabel="Обновление порядка элементов" // опционально
/>
```

**Пропсы**:
- `isReordering: boolean` - Идет ли процесс переупорядочивания
- `message?: string` - Сообщение (по умолчанию "Обновление порядка...")
- `ariaLabel?: string` - ARIA label (по умолчанию "Обновление порядка элементов")

**Применение**: Используется во всех таблицах с drag & drop функциональностью.

---

### 8.3. Пример использования в таблице

```tsx
'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TableCell, TableRow } from '@/components/ui/table';
import { 
  DragHandle, 
  DeleteDialog, 
  RowActions 
} from '@/components/admin/shared';

const SortableRow = ({ item, index, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDeleteClick = () => {
    setDeletingId(item.id);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await onDelete(deletingId);
      setDeletingId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
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
            ariaLabel="Переместить элемент"
          />
        </TableCell>
        <TableCell>{item.name}</TableCell>
        <TableCell className="text-right">
          <RowActions
            itemId={item.id}
            editHref={`/admin/dashboard/items/${item.id}/edit`}
            onDeleteClick={handleDeleteClick}
            isDeleting={isDeleting}
          />
        </TableCell>
      </TableRow>

      <DeleteDialog
        itemId={deletingId}
        itemName={item.name}
        isOpen={!!deletingId}
        isDeleting={isDeleting}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Удалить элемент?"
      />
    </>
  );
};
```

---

### 8.4. Чеклист использования shared компонентов

При создании новой таблицы в админ-панели:

- [ ] Используется `DragHandle` для drag & drop функциональности
- [ ] Используется `DeleteDialog` для подтверждения удаления
- [ ] Используется `RowActions` для кнопок редактирования/удаления
- [ ] Используется `TableEmptyState` для пустого состояния
- [ ] Используется `ReorderingOverlay` для индикатора загрузки при переупорядочивании
- [ ] Все компоненты импортируются из `@/components/admin/shared`
- [ ] ARIA labels настроены корректно для доступности
- [ ] Пропсы переданы с правильными значениями

---

### 8.5. Преимущества использования shared компонентов

1. ✅ **Консистентность UX** - одинаковое поведение во всех таблицах
2. ✅ **Меньше дублирования кода** - переиспользование компонентов
3. ✅ **Легче поддержка** - изменения в одном месте применяются везде
4. ✅ **Типобезопасность** - единые интерфейсы для всех таблиц
5. ✅ **Доступность** - встроенная поддержка ARIA атрибутов

---

**Примечание**: Эти guidelines должны применяться ко всем страницам админ-панели для обеспечения консистентного UX на всех устройствах.

