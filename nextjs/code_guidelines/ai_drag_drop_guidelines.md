# Drag & Drop Guidelines для таблиц в админ-панели

## Версия: 1.0
**Дата создания:** 08.11.2025  
**Проект:** Landing Page Электрика (MVP)  
**Статус:** Актуально ✅

---

## 📋 Обзор

Данный документ описывает стандартизированную логику реализации drag & drop функциональности для изменения порядка элементов в таблицах админ-панели. Эта логика используется для переупорядочивания элементов галереи и услуг.

---

## 🎯 Назначение

Эти guidelines обеспечивают:
- **Единообразие**: Одинаковая логика drag & drop во всех таблицах
- **UX консистентность**: Единый пользовательский опыт при работе с сортируемыми таблицами
- **Поддерживаемость**: Легко понять и расширить функциональность
- **Надежность**: Обработка ошибок и откат изменений при неудаче

---

## ⚖️ Требования к bundle
- Компоненты drag & drop должны быть максимально серверными; клиентскую часть оставляем только для непосредственного взаимодействия `@dnd-kit`.
- Библиотека `@dnd-kit` подключается через `next/dynamic` и инициализируется только внутри client‑островка, чтобы не увеличивать общий bundle страниц без drag & drop.
- Все преобразования данных выполняются на сервере. Клиент получает уже отсортированные массивы и минимальные payloads.

> [!NOTE]
> Для общих принципов оптимизации bundle используйте индекс guidelines в `README.md`. Автоматизированный анализ bundle может настраиваться отдельно для конкретного проекта.

---

## 📦 Используемые библиотеки

### @dnd-kit

Проект использует библиотеку `@dnd-kit` для реализации drag & drop функциональности:

```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

**Почему @dnd-kit:**
- ✅ Легковесная и производительная
- ✅ Поддержка клавиатурной навигации (accessibility)
- ✅ TypeScript поддержка из коробки
- ✅ Гибкая настройка сенсоров
- ✅ Хорошая документация и активное сообщество

---

## 🏗️ Архитектура компонента

### Структура компонента

Каждый компонент таблицы с drag & drop состоит из следующих частей:

1. **Основной компонент таблицы** (`GalleryTable`, `ServicesTable`)
2. **Компонент сортируемой строки** (`SortableRow`)
3. **Server Action для сохранения порядка** (`reorderGalleryItems`, `reorderServices`)

### Иерархия компонентов

```
DndContext (контекст drag & drop)
  └── SortableContext (контекст сортировки)
      └── SortableRow (сортируемая строка)
          └── TableRow (строка таблицы)
```

---

## 📝 Реализация компонента

### 1. Импорты

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
```

### 2. Интерфейсы и типы

```typescript
interface Item {
  id: string;
  order: number;
  // ... другие поля
}

interface TableProps {
  initialItems: Item[];
}
```

### 3. Компонент сортируемой строки

```typescript
/**
 * Компонент сортируемой строки таблицы
 */
function SortableRow({ item, onDelete }: { item: Item; onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

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
      <TableCell className="w-10">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-muted rounded"
          aria-label="Переместить элемент"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      {/* Остальные ячейки таблицы */}
    </TableRow>
  );
}
```

**Ключевые моменты:**
- `useSortable` хук предоставляет все необходимые атрибуты и обработчики
- `setNodeRef` привязывает элемент к системе drag & drop
- `transform` и `transition` обеспечивают плавную анимацию
- `isDragging` используется для визуальной обратной связи
- Кнопка с иконкой `GripVertical` служит ручкой для перетаскивания
- `touch-none` предотвращает конфликты с нативным touch-поведением

### 4. Основной компонент таблицы

```typescript
/**
 * Компонент таблицы с поддержкой drag & drop
 */
export function TableComponent({ initialItems }: TableProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [isReordering, setIsReordering] = useState(false);

  // Настройка сенсоров для drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Обработка завершения перетаскивания
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // Проверка: элемент перетащен на другой элемент
    if (!over || active.id === over.id) {
      return;
    }

    // Находим индексы элементов
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    // Проверка валидности индексов
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Обновляем порядок локально (оптимистичное обновление)
    const newItems = arrayMove(items, oldIndex, newIndex);
    
    // Обновляем поле order для всех элементов
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order: index,
    }));

    // Обновляем состояние
    setItems(reorderedItems);
    setIsReordering(true);

    // Сохраняем новый порядок на сервере
    const result = await reorderItems(
      reorderedItems.map((item) => ({
        id: item.id,
        order: item.order,
      }))
    );

    if (result.success) {
      toast.success('Порядок элементов обновлен');
      router.refresh();
    } else {
      toast.error(result.error || 'Ошибка обновления порядка');
      // Откатываем изменения при ошибке
      setItems(initialItems);
    }

    setIsReordering(false);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {/* Заголовки таблицы */}
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={N} className="text-center text-muted-foreground py-8">
                  Элементы не найдены
                </TableCell>
              </TableRow>
            ) : (
              <SortableContext
                items={items.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((item) => (
                  <SortableRow key={item.id} item={item} onDelete={handleDelete} />
                ))}
              </SortableContext>
            )}
          </TableBody>
        </Table>
      </div>
      {isReordering && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium">Обновление порядка...</p>
          </div>
        </div>
      )}
    </DndContext>
  );
}
```

---

## 🔧 Настройка сенсоров

### PointerSensor

Обрабатывает события мыши и touch-устройств:

```typescript
useSensor(PointerSensor)
```

**Особенности:**
- Работает с мышью и touch-устройствами
- Автоматически определяет тип взаимодействия
- Поддерживает drag & drop на мобильных устройствах

### KeyboardSensor

Обеспечивает доступность через клавиатуру:

```typescript
useSensor(KeyboardSensor, {
  coordinateGetter: sortableKeyboardCoordinates,
})
```

**Особенности:**
- Позволяет перемещать элементы с помощью клавиатуры
- Стрелки вверх/вниз для перемещения
- Space для активации перетаскивания
- Enter для подтверждения

**Важно:** Оба сенсора должны быть настроены для полной поддержки accessibility.

---

## 🎨 Визуальная обратная связь

### Во время перетаскивания

1. **Прозрачность элемента:**
   ```typescript
   opacity: isDragging ? 0.5 : 1
   ```

2. **Фон строки:**
   ```typescript
   className={isDragging ? 'bg-muted' : ''}
   ```

3. **Курсор:**
   ```typescript
   className="cursor-grab active:cursor-grabbing"
   ```

### Индикатор загрузки

При сохранении порядка показывается overlay с сообщением:

```typescript
{isReordering && (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="text-center">
      <p className="text-lg font-medium">Обновление порядка...</p>
    </div>
  </div>
)}
```

---

## 🔄 Логика обработки перетаскивания

### Шаг 1: Валидация события

```typescript
if (!over || active.id === over.id) {
  return; // Элемент не перетащен или перетащен на себя
}
```

### Шаг 2: Поиск индексов

```typescript
const oldIndex = items.findIndex((item) => item.id === active.id);
const newIndex = items.findIndex((item) => item.id === over.id);

if (oldIndex === -1 || newIndex === -1) {
  return; // Элементы не найдены
}
```

### Шаг 3: Оптимистичное обновление UI

```typescript
const newItems = arrayMove(items, oldIndex, newIndex);
const reorderedItems = newItems.map((item, index) => ({
  ...item,
  order: index,
}));

setItems(reorderedItems);
setIsReordering(true);
```

**Почему оптимистичное обновление:**
- Мгновенная обратная связь пользователю
- UI обновляется до получения ответа от сервера
- При ошибке изменения откатываются

### Шаг 4: Сохранение на сервере

```typescript
const result = await reorderItems(
  reorderedItems.map((item) => ({
    id: item.id,
    order: item.order,
  }))
);
```

### Шаг 5: Обработка результата

```typescript
if (result.success) {
  toast.success('Порядок элементов обновлен');
  router.refresh(); // Обновляем данные с сервера
} else {
  toast.error(result.error || 'Ошибка обновления порядка');
  setItems(initialItems); // Откатываем изменения
}
```

---

## 🗄️ Server Action для сохранения порядка

### Структура Server Action

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';

export async function reorderItems(
  items: Array<{ id: string; order: number }>
): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  try {
    // Обновляем порядок всех элементов в транзакции
    await prisma.$transaction(
      items.map((item) =>
        prisma.item.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    // Ревалидируем кеш
    revalidatePath('/');
    revalidatePath('/admin/dashboard/items');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error reordering items:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка изменения порядка элементов',
    };
  }
}
```

**Ключевые моменты:**
- Использование транзакции для атомарности обновлений
- Ревалидация кеша после успешного обновления
- Обработка ошибок с понятными сообщениями
- Discriminated union для типизированного ответа

---

## 📋 Чек-лист реализации

При создании новой таблицы с drag & drop убедитесь, что:

- [ ] Установлены зависимости `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- [ ] Компонент помечен как `'use client'`
- [ ] Настроены оба сенсора (`PointerSensor`, `KeyboardSensor`)
- [ ] Реализован компонент `SortableRow` с правильными атрибутами
- [ ] Добавлена кнопка с иконкой `GripVertical` для перетаскивания
- [ ] Реализована функция `handleDragEnd` с оптимистичным обновлением
- [ ] Добавлена обработка ошибок с откатом изменений
- [ ] Показывается индикатор загрузки при сохранении
- [ ] Создан Server Action для сохранения порядка
- [ ] Server Action использует транзакцию для обновления
- [ ] Добавлена ревалидация кеша после успешного обновления
- [ ] Реализована визуальная обратная связь (прозрачность, фон)
- [ ] Добавлены ARIA атрибуты для accessibility

---

## 🎯 Примеры использования

### Пример 1: Таблица галереи

**Файл:** `src/components/admin/GalleryTable.tsx`

```typescript
export function GalleryTable({ initialItems }: GalleryTableProps) {
  // ... реализация
  const result = await reorderGalleryItems(/* ... */);
}
```

**Server Action:** `src/actions/gallery.ts`

```typescript
export async function reorderGalleryItems(
  items: Array<{ id: string; order: number }>
) {
  // ... реализация
}
```

### Пример 2: Таблица услуг

**Файл:** `src/components/admin/ServicesTable.tsx`

```typescript
export function ServicesTable({ initialServices }: ServicesTableProps) {
  // ... реализация
  const result = await reorderServices(/* ... */);
}
```

**Server Action:** `src/actions/services.ts`

```typescript
export async function reorderServices(
  items: Array<{ id: string; order: number }>
) {
  // ... реализация
}
```

---

## ⚠️ Важные замечания

### 1. Оптимистичное обновление

Всегда обновляйте UI до получения ответа от сервера. Это обеспечивает мгновенную обратную связь пользователю.

### 2. Откат при ошибке

При ошибке сохранения обязательно откатывайте изменения к исходному состоянию:

```typescript
if (!result.success) {
  setItems(initialItems); // Откат к исходному состоянию
}
```

### 3. Ревалидация кеша

После успешного сохранения ревалидируйте кеш для обновления данных на всех страницах:

```typescript
revalidatePath('/');
revalidatePath('/admin/dashboard/items');
```

### 4. Транзакции в БД

Используйте транзакции для атомарного обновления всех элементов:

```typescript
await prisma.$transaction(
  items.map((item) => prisma.item.update({ /* ... */ }))
);
```

### 5. Accessibility

Всегда настраивайте оба сенсора (`PointerSensor` и `KeyboardSensor`) для поддержки клавиатурной навигации.

---

## 🔍 Отладка

### Проблема: Элементы не перетаскиваются

**Проверьте:**
- Компонент помечен как `'use client'`
- `setNodeRef` правильно привязан к элементу
- `attributes` и `listeners` переданы в элемент для перетаскивания
- `SortableContext` правильно обернут вокруг элементов

### Проблема: Порядок не сохраняется

**Проверьте:**
- Server Action вызывается корректно
- Транзакция выполняется успешно
- Ревалидация кеша работает
- Обработка ошибок не скрывает реальные проблемы

### Проблема: Нет визуальной обратной связи

**Проверьте:**
- `isDragging` используется для стилизации
- `transform` и `transition` применяются к элементу
- CSS классы правильно настроены

---

## 📚 Дополнительные ресурсы

- [@dnd-kit Documentation](https://docs.dndkit.com/)
- [@dnd-kit Sortable](https://docs.dndkit.com/presets/sortable)
- [Accessibility with @dnd-kit](https://docs.dndkit.com/guides/accessibility)

---

## 🤖 Инструкции для AI ассистентов

При создании новой таблицы с drag & drop функциональностью:

1. **Используйте этот документ как шаблон** для реализации
2. **Следуйте структуре** существующих компонентов (`GalleryTable`, `ServicesTable`)
3. **Обеспечьте идентичность логики** во всех таблицах
4. **Проверьте чек-лист** перед завершением реализации
5. **Добавьте Server Action** для сохранения порядка
6. **Протестируйте** на разных устройствах (desktop, mobile, keyboard navigation)

---

**Версия документа:** 1.0  
**Последнее обновление:** 08.11.2025  
**Проект:** Landing Page Электрика (MVP)  
**Локация:** Могилёв, Беларусь 🇧🇾







