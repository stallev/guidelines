# Forms & Validation Guidelines

## Версия документа: 1.0
**Дата создания:** 23.11.2025  
**Проект:** Landing Page + Admin Dashboard  
**Назначение:** Руководство по формам и валидации данных

---

## 📋 О документе

Этот документ описывает best practices для создания форм с использованием react-hook-form, Zod валидации и Shadcn UI компонентов.

**Обязательные требования:**
- При создании компонентов следовать [`docs/guidelines/react/ai_component_guidelines.md`](../react/ai_component_guidelines.md)
- При создании hooks следовать [`docs/guidelines/react/ai_react_hooks_guidelines.md`](../react/ai_react_hooks_guidelines.md)
- При работе с Server Actions следовать [`SERVER_ACTIONS_GUIDELINES.md`](./SERVER_ACTIONS_GUIDELINES.md)

---

## I. ZOD SCHEMAS

### 1.1. Базовая структура Zod schema

```typescript
// lib/validations/service.ts
import { z } from 'zod';

export const ServiceSchema = z.object({
  name: z.string()
    .min(2, 'Минимум 2 символа')
    .max(100, 'Максимум 100 символов'),
  
  slug: z.string()
    .min(2, 'Минимум 2 символа')
    .regex(/^[a-z0-9-]+$/, 'Только латиница, цифры и дефисы'),
  
  shortDescription: z.string()
    .min(10, 'Минимум 10 символов')
    .max(200, 'Максимум 200 символов'),
  
  fullDescription: z.string()
    .max(1000, 'Максимум 1000 символов')
    .optional(),
  
  price: z.string()
    .min(1, 'Цена обязательна')
    .regex(/^\d+(\.\d{1,2})?$/, 'Неверный формат цены'),
  
  unit: z.string()
    .default('услуга'),
  
  active: z.boolean()
    .default(true),
  
  icon: z.string()
    .optional(),
  
  image: z.string()
    .url('Неверный URL')
    .optional(),
});

// TypeScript тип из Zod
export type ServiceFormData = z.infer<typeof ServiceSchema>;
```

### 1.2. Кастомная валидация

```typescript
// ✅ Кастомная валидация в Zod
export const ServiceSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  slug: z.string()
    .min(2, 'Минимум 2 символа')
    .refine(
      (slug) => /^[a-z0-9-]+$/.test(slug),
      'Только латиница, цифры и дефисы'
    ),
  price: z.string()
    .refine(
      (price) => !isNaN(parseFloat(price)) && parseFloat(price) > 0,
      'Цена должна быть положительным числом'
    ),
});

// Async валидация (например, проверка уникальности)
export const ServiceSchema = z.object({
  slug: z.string()
    .min(2)
    .refine(async (slug) => {
      const existing = await prisma.service.findUnique({
        where: { slug },
      });
      return !existing;
    }, 'Slug уже используется'),
});
```

---

## II. REACT-HOOK-FORM

### 2.1. Базовая форма

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  email: z.string().email('Неверный email'),
  phone: z.string().regex(/^\+375\d{9}$/, 'Формат: +375XXXXXXXXX'),
});

export const OrderForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имя</FormLabel>
              <FormControl>
                <Input placeholder="Иван Иванов" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="ivan@example.com" {...field} />
              </FormControl>
              <FormDescription>
                Мы отправим подтверждение на этот email
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Отправка...' : 'Отправить'}
        </Button>
      </form>
    </Form>
  );
};
```

### 2.2. Форма с Server Action

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createService } from '@/actions/services';
import { ServiceSchema } from '@/lib/validations/service';

export const ServiceForm = () => {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(ServiceSchema),
    defaultValues: {
      name: '',
      slug: '',
      shortDescription: '',
      price: '',
      unit: 'услуга',
      active: true,
    },
  });

  const onSubmit = async (values) => {
    // Конвертируем в FormData для Server Action
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
};
```

---

## III. ТИПЫ ПОЛЕЙ

### 3.1. Input (текстовое поле)

```typescript
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Название</FormLabel>
      <FormControl>
        <Input placeholder="Введите название" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 3.2. Textarea (многострочный текст)

```typescript
import { Textarea } from '@/components/ui/textarea';

<FormField
  control={form.control}
  name="description"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Описание</FormLabel>
      <FormControl>
        <Textarea 
          placeholder="Введите описание"
          rows={5}
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 3.3. Select (выпадающий список)

```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

<FormField
  control={form.control}
  name="unit"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Единица измерения</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Выберите единицу" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="услуга">услуга</SelectItem>
          <SelectItem value="час">час</SelectItem>
          <SelectItem value="м²">м²</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 3.4. Checkbox (чекбокс)

```typescript
import { Checkbox } from '@/components/ui/checkbox';

<FormField
  control={form.control}
  name="active"
  render={({ field }) => (
    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
      <FormControl>
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
      <div className="space-y-1 leading-none">
        <FormLabel>Активна</FormLabel>
        <FormDescription>
          Услуга будет отображаться на сайте
        </FormDescription>
      </div>
    </FormItem>
  )}
/>
```

### 3.5. File Upload

```typescript
<FormField
  control={form.control}
  name="image"
  render={({ field: { value, onChange, ...field } }) => (
    <FormItem>
      <FormLabel>Изображение</FormLabel>
      <FormControl>
        <Input
          type="file"
          accept="image/*"
          {...field}
          onChange={(e) => {
            const file = e.target.files?.[0];
            onChange(file);
          }}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## IV. ВАЛИДАЦИЯ

### 4.1. Валидация в реальном времени

```typescript
const form = useForm({
  resolver: zodResolver(schema),
  mode: 'onChange',  // Валидация при изменении
  // mode: 'onBlur',  // Валидация при потере фокуса
  // mode: 'onSubmit', // Валидация при отправке (default)
});
```

### 4.2. Кастомные error messages

```typescript
<FormField
  control={form.control}
  name="price"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Цена</FormLabel>
      <FormControl>
        <Input type="text" {...field} />
      </FormControl>
      <FormMessage />
      {form.formState.errors.price?.type === 'custom' && (
        <p className="text-sm text-destructive mt-1">
          Кастомная ошибка валидации
        </p>
      )}
    </FormItem>
  )}
/>
```

### 4.3. Программная установка ошибок

```typescript
const onSubmit = async (values) => {
  const result = await createService(values);
  
  if (!result.success) {
    // Установить ошибку для конкретного поля
    form.setError('name', {
      type: 'manual',
      message: result.error,
    });
    
    // Или общую ошибку формы
    form.setError('root', {
      type: 'manual',
      message: 'Ошибка создания услуги',
    });
  }
};

// Отображение root error
{form.formState.errors.root && (
  <div className="text-sm text-destructive">
    {form.formState.errors.root.message}
  </div>
)}
```

---

## V. ОПТИМИЗАЦИЯ ФОРМ

### 5.1. Default values из пропсов

```typescript
interface ServiceFormProps {
  service?: Service;
}

export const ServiceForm = ({ service }: ServiceFormProps) => {
  const form = useForm({
    resolver: zodResolver(ServiceSchema),
    defaultValues: service ? {
      name: service.name,
      slug: service.slug,
      shortDescription: service.shortDescription,
      price: service.price,
      unit: service.unit,
      active: service.active,
    } : {
      name: '',
      slug: '',
      shortDescription: '',
      price: '',
      unit: 'услуга',
      active: true,
    },
  });

  // ...
};
```

### 5.2. Reset формы

```typescript
const onSubmit = async (values) => {
  const result = await createService(values);
  
  if (result.success) {
    form.reset(); // Сбросить форму к default values
    toast.success('Услуга создана');
  }
};

// Или сбросить к конкретным значениям
form.reset({
  name: 'Новое значение',
  slug: '',
});
```

### 5.3. Watch изменения полей

```typescript
const watchName = form.watch('name');
const watchAllFields = form.watch();

// Auto-generate slug из name
useEffect(() => {
  const slug = watchName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  form.setValue('slug', slug);
}, [watchName]);
```

---

## VI. СОСТОЯНИЯ ФОРМЫ

### 6.1. Loading state

```typescript
<Button 
  type="submit" 
  disabled={form.formState.isSubmitting}
>
  {form.formState.isSubmitting ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Сохранение...
    </>
  ) : (
    'Сохранить'
  )}
</Button>
```

### 6.2. Dirty state (изменения)

```typescript
// Показать кнопку "Сохранить" только если есть изменения
{form.formState.isDirty && (
  <Button type="submit">
    Сохранить изменения
  </Button>
)}

// Предупреждение при покидании страницы с несохраненными изменениями
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (form.formState.isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [form.formState.isDirty]);
```

---

## VII. CHECKLIST

### 7.1. Checklist для форм

- [ ] **Zod Schema**
  - [ ] Схема определена в `lib/validations/`
  - [ ] Типы выведены из Zod (`z.infer`)
  - [ ] Кастомные error messages
  - [ ] Валидация корректна

- [ ] **react-hook-form**
  - [ ] Используется `zodResolver`
  - [ ] Default values установлены
  - [ ] `Form` компонент из Shadcn UI
  - [ ] `FormField` для каждого поля

- [ ] **Поля формы**
  - [ ] Правильные типы полей (Input, Textarea, Select)
  - [ ] `FormLabel` для каждого поля
  - [ ] `FormMessage` для ошибок
  - [ ] `FormDescription` где нужно

- [ ] **Submit**
  - [ ] Loading state при отправке
  - [ ] Disabled кнопка при isSubmitting
  - [ ] Toast notifications для feedback
  - [ ] Error handling

- [ ] **UX**
  - [ ] Placeholder текст для полей
  - [ ] Auto-focus на первое поле
  - [ ] Enter отправляет форму
  - [ ] Escape закрывает модальное окно

---

## VIII. СВЯЗАННЫЕ ДОКУМЕНТЫ

- [`docs/guidelines/react/ai_component_guidelines.md`](../react/ai_component_guidelines.md) - Паттерны компонентов
- [`SERVER_ACTIONS_GUIDELINES.md`](./SERVER_ACTIONS_GUIDELINES.md) - Server Actions
- [`UI_COMPONENTS_GUIDELINES.md`](./UI_COMPONENTS_GUIDELINES.md) - UI компоненты
- [react-hook-form Documentation](https://react-hook-form.com/) - Официальная документация
- [Zod Documentation](https://zod.dev/) - Официальная документация

---

**Версия документа:** 1.0  
**Последнее обновление:** 23.11.2025  
**Статус:** ✅ Актуально

