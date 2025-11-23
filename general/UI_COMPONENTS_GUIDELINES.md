# UI Components Guidelines

## Версия документа: 1.0
**Дата создания:** 23.11.2025  
**Проект:** Landing Page + Admin Dashboard  
**Назначение:** Руководство по созданию UI компонентов с Shadcn UI

---

## 📋 О документе

Этот документ описывает best practices для создания UI компонентов с использованием Shadcn UI, Tailwind CSS и Radix UI primitives.

**Обязательные требования:**
- **ВСЕГДА** следовать паттернам из [`docs/guidelines/react/ai_component_guidelines.md`](../react/ai_component_guidelines.md)
- При создании hooks следовать [`docs/guidelines/react/ai_react_hooks_guidelines.md`](../react/ai_react_hooks_guidelines.md)
- При создании таблиц следовать [`docs/guidelines/react/ai_responsive_table_guidelines.md`](../react/ai_responsive_table_guidelines.md)

---

## I. SHADCN UI

### 1.1. Структура Shadcn UI компонентов

```
src/components/
├── ui/                          // ✅ ТОЛЬКО Shadcn UI компоненты
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   ├── card.tsx
│   └── ...                      // 50+ компонентов
├── admin/                       // Компоненты админ-панели
│   └── ServiceForm.tsx          // Использует компоненты из ui/
├── landing/                     // Компоненты landing page
│   └── Hero.tsx                 // Использует компоненты из ui/
└── shared/                      // Общие компоненты
    └── Header.tsx               // Использует компоненты из ui/
```

### 1.2. Использование Shadcn UI компонентов

```typescript
// ✅ Правильное использование Shadcn UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const ServiceForm = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Создание услуги</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <Input placeholder="Название услуги" />
          <Button type="submit">Создать</Button>
        </form>
      </CardContent>
    </Card>
  );
};

// ❌ НЕ изменяйте файлы в components/ui/
// Используйте className для кастомизации
<Button className="bg-blue-500 hover:bg-blue-600">
  Кастомная кнопка
</Button>
```

### 1.3. Установка новых Shadcn UI компонентов

```bash
# Установить все компоненты сразу (уже выполнено)
npx shadcn-ui@latest add --all

# Установить конкретный компонент
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
```

---

## II. TAILWIND CSS 4

### 2.1. Utility-first подход

```typescript
// ✅ Используйте utility классы Tailwind
export const ServiceCard = ({ service }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-bold mb-2">{service.name}</h3>
      <p className="text-gray-600 mb-4">{service.shortDescription}</p>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-blue-600">
          {service.price} ₽
        </span>
        <Button size="sm">Заказать</Button>
      </div>
    </div>
  );
};

// ❌ НЕ используйте inline styles
<div style={{ backgroundColor: 'white', padding: '24px' }}>
  {/* НЕ ДЕЛАЙТЕ ТАК! */}
</div>
```

### 2.2. Адаптивный дизайн

```typescript
// ✅ Используйте Tailwind breakpoints
export const ServiceCard = ({ service }) => {
  return (
    <div className="
      w-full              // Mobile: полная ширина
      sm:w-1/2            // Tablet: 50% ширины
      md:w-1/3            // Desktop: 33% ширины
      lg:w-1/4            // Large: 25% ширины
      p-4                 // Padding на всех экранах
      sm:p-6              // Больше padding на tablet+
    ">
      <Card>
        <CardHeader className="
          text-lg           // Mobile: 18px
          sm:text-xl        // Tablet: 20px
          md:text-2xl       // Desktop: 24px
        ">
          {service.name}
        </CardHeader>
      </Card>
    </div>
  );
};

// Breakpoints Tailwind:
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px
```

### 2.3. Семантические цвета

```typescript
// ✅ Используйте семантические классы
<div className="
  bg-background          // Цвет фона
  text-foreground        // Цвет текста
  border-border          // Цвет border
  text-muted-foreground  // Приглушенный текст
  bg-primary            // Основной цвет
  text-primary-foreground // Текст на primary фоне
  bg-destructive        // Цвет для удаления
  bg-accent             // Акцентный цвет
">
  Content
</div>

// ❌ Избегайте хардкода цветов
<div className="bg-blue-500 text-white">
  {/* Не поддерживает темную тему */}
</div>
```

---

## III. BUTTON COMPONENT

### 3.1. Варианты Button

```typescript
import { Button } from '@/components/ui/button';

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">
  <Icon />
</Button>

// С иконкой
<Button>
  <Plus className="h-4 w-4 mr-2" />
  Создать услугу
</Button>

// Loading state
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Загрузка...
    </>
  ) : (
    'Создать'
  )}
</Button>
```

### 3.2. Button как Link

```typescript
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// ✅ Button как Link
<Button asChild>
  <Link href="/admin/dashboard/services/new">
    Создать услугу
  </Link>
</Button>
```

---

## IV. FORM COMPONENTS

### 4.1. Form + react-hook-form

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  slug: z.string().min(2, 'Минимум 2 символа'),
  price: z.string().min(1, 'Цена обязательна'),
});

export const ServiceForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      price: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Submit logic
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название услуги</FormLabel>
              <FormControl>
                <Input placeholder="Установка люстры" {...field} />
              </FormControl>
              <FormDescription>
                Короткое название услуги
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL (slug)</FormLabel>
              <FormControl>
                <Input placeholder="ustanovka-lyustry" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Создание...' : 'Создать услугу'}
        </Button>
      </form>
    </Form>
  );
};
```

---

## V. DIALOG / MODAL

### 5.1. Dialog Component

```typescript
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const OrderModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Заказать услугу</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Заказ услуги</DialogTitle>
          <DialogDescription>
            Заполните форму для заказа услуги
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Form fields */}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button type="submit">Отправить заявку</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

### 5.2. AlertDialog для подтверждения

```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const DeleteDialog = ({ isOpen, onClose, onConfirm, itemName }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
          <AlertDialogDescription>
            Вы действительно хотите удалить "{itemName}"?
            Это действие нельзя отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive">
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
```

---

## VI. CARD COMPONENT

### 6.1. Card структура

```typescript
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

export const ServiceCard = ({ service }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{service.name}</CardTitle>
        <CardDescription>{service.unit}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{service.shortDescription}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className="text-2xl font-bold text-primary">
          {service.price} ₽
        </span>
        <Button>Заказать</Button>
      </CardFooter>
    </Card>
  );
};
```

---

## VII. TABLE COMPONENT

### 7.1. Базовая структура таблицы

```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const ServicesTable = ({ services }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>№</TableHead>
          <TableHead>Название</TableHead>
          <TableHead>Цена</TableHead>
          <TableHead className="text-right">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((service, index) => (
          <TableRow key={service.id}>
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell>{service.name}</TableCell>
            <TableCell>{service.price} ₽</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
```

**📖 Подробнее:** Для адаптивных таблиц см. [`docs/guidelines/react/ai_responsive_table_guidelines.md`](../react/ai_responsive_table_guidelines.md)

---

## VIII. TOAST NOTIFICATIONS

### 8.1. Использование Sonner

```typescript
'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export const Component = () => {
  const handleSuccess = () => {
    toast.success('Услуга создана успешно');
  };

  const handleError = () => {
    toast.error('Ошибка создания услуги');
  };

  const handleInfo = () => {
    toast.info('Информация');
  };

  const handleWarning = () => {
    toast.warning('Предупреждение');
  };

  const handlePromise = async () => {
    toast.promise(
      createService(),
      {
        loading: 'Создание услуги...',
        success: 'Услуга создана!',
        error: 'Ошибка создания',
      }
    );
  };

  return (
    <>
      <Button onClick={handleSuccess}>Success</Button>
      <Button onClick={handleError}>Error</Button>
    </>
  );
};
```

### 8.2. Toaster в layout

```typescript
// app/layout.tsx
import { Toaster } from 'sonner';

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
```

---

## IX. ACCESSIBILITY

### 9.1. ARIA attributes

```typescript
// ✅ Правильные ARIA attributes
<Button 
  aria-label="Удалить услугу"
  aria-describedby="delete-description"
>
  <Trash className="h-4 w-4" />
</Button>

<div id="delete-description" className="sr-only">
  Это действие нельзя отменить
</div>

// Disabled состояние
<Button disabled aria-disabled="true">
  Недоступно
</Button>

// Loading состояние
<Button disabled aria-busy="true">
  Загрузка...
</Button>
```

### 9.2. Keyboard navigation

```typescript
// ✅ Keyboard navigation для модальных окон
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Заголовок</DialogTitle>
    </DialogHeader>
    {/* Фокус автоматически перемещается в диалог */}
    {/* ESC закрывает диалог */}
    {/* Tab навигация между элементами */}
  </DialogContent>
</Dialog>
```

---

## X. CHECKLIST

### 10.1. Checklist для UI компонентов

- [ ] **Shadcn UI**
  - [ ] Используются компоненты из `components/ui/`
  - [ ] НЕ изменяются файлы в `components/ui/`
  - [ ] Кастомизация через `className`

- [ ] **Tailwind CSS**
  - [ ] Используются utility классы
  - [ ] Адаптивность через breakpoints
  - [ ] Семантические цвета (bg-primary, text-foreground)
  - [ ] НЕ используются inline styles

- [ ] **Компоненты**
  - [ ] Следуют паттернам из [`ai_component_guidelines.md`](../react/ai_component_guidelines.md)
  - [ ] TypeScript типы определены
  - [ ] JSDoc комментарии добавлены
  - [ ] Props interface экспортирован

- [ ] **Формы**
  - [ ] Используется react-hook-form
  - [ ] Валидация через Zod
  - [ ] Form компоненты из Shadcn UI
  - [ ] Error messages отображаются

- [ ] **Accessibility**
  - [ ] ARIA labels для иконок
  - [ ] Keyboard navigation поддерживается
  - [ ] Focus indicators видимы
  - [ ] Screen reader friendly

- [ ] **Performance**
  - [ ] НЕ используется inline styles
  - [ ] Dynamic imports для больших компонентов
  - [ ] Оптимизированы изображения

---

## XI. СВЯЗАННЫЕ ДОКУМЕНТЫ

- [`docs/guidelines/react/ai_component_guidelines.md`](../react/ai_component_guidelines.md) - **ОБЯЗАТЕЛЬНО** для всех компонентов
- [`docs/guidelines/react/ai_responsive_table_guidelines.md`](../react/ai_responsive_table_guidelines.md) - Адаптивные таблицы
- [`FORMS_VALIDATION_GUIDELINES.md`](./FORMS_VALIDATION_GUIDELINES.md) - Формы и валидация
- [Shadcn UI Documentation](https://ui.shadcn.com/) - Официальная документация
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Официальная документация

---

**Версия документа:** 1.0  
**Последнее обновление:** 23.11.2025  
**Статус:** ✅ Актуально

