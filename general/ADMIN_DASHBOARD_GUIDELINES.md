# Admin Dashboard Guidelines

## Версия документа: 1.0
**Дата создания:** 23.11.2025  
**Проект:** Landing Page + Admin Dashboard  
**Назначение:** Comprehensive руководство по созданию админ-панелей

---

## 📋 О документе

Этот документ объединяет все best practices для создания страниц и компонентов админ-панели, включая layout, навигацию, таблицы и формы.

**Базовый документ:** [`docs/guidelines/admin_pages/ai_admin_page_components_guidelines.md`](../admin_pages/ai_admin_page_components_guidelines.md)

**Обязательные требования:**
- При создании компонентов следовать [`docs/guidelines/react/ai_component_guidelines.md`](../react/ai_component_guidelines.md)
- При создании таблиц следовать [`docs/guidelines/react/ai_responsive_table_guidelines.md`](../react/ai_responsive_table_guidelines.md)
- При работе с drag & drop следовать [`DRAG_DROP_GUIDELINES.md`](./DRAG_DROP_GUIDELINES.md)
- При работе с формами следовать [`FORMS_VALIDATION_GUIDELINES.md`](./FORMS_VALIDATION_GUIDELINES.md)

---

## I. ADMIN LAYOUT

### 1.1. Структура админ-панели

```typescript
// app/admin/dashboard/layout.tsx
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';

export default function AdminLayout({ children }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <AdminBreadcrumbs />
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

### 1.2. Sidebar Component

```typescript
// components/admin/AdminSidebar.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  ShoppingCart,
  Wrench,
  Star,
  Image,
  HelpCircle,
  FileText,
  Settings,
} from 'lucide-react';
import { SignOutButton } from './SignOutButton';

const menuItems = [
  {
    title: 'Главная',
    url: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Заказы',
    url: '/admin/dashboard',
    icon: ShoppingCart,
  },
  {
    title: 'Услуги',
    url: '/admin/dashboard/services',
    icon: Wrench,
  },
  {
    title: 'Отзывы',
    url: '/admin/dashboard/reviews',
    icon: Star,
  },
  {
    title: 'Галерея',
    url: '/admin/dashboard/gallery',
    icon: Image,
  },
  {
    title: 'FAQ',
    url: '/admin/dashboard/faq',
    icon: HelpCircle,
  },
  {
    title: 'Страницы',
    url: '/admin/dashboard/pages',
    icon: FileText,
  },
  {
    title: 'Настройки',
    url: '/admin/dashboard/settings',
    icon: Settings,
  },
];

export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SignOutButton />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
```

### 1.3. Breadcrumbs Component

```typescript
// components/admin/AdminBreadcrumbs.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const breadcrumbLabels: Record<string, string> = {
  'dashboard': 'Главная',
  'services': 'Услуги',
  'orders': 'Заказы',
  'reviews': 'Отзывы',
  'gallery': 'Галерея',
  'faq': 'FAQ',
  'pages': 'Страницы',
  'settings': 'Настройки',
  'new': 'Создание',
  'edit': 'Редактирование',
};

export const AdminBreadcrumbs = () => {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  
  // Remove 'admin' segment
  const breadcrumbs = segments.slice(1).map((segment, index) => ({
    label: breadcrumbLabels[segment] || segment,
    href: '/admin/' + segments.slice(1, index + 2).join('/'),
    isLast: index === segments.slice(1).length - 1,
  }));

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <BreadcrumbItem key={crumb.href}>
            {crumb.isLast ? (
              <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
            ) : (
              <>
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
                <BreadcrumbSeparator />
              </>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
```

---

## II. PAGE COMPONENTS

### 2.1. PageHeader (для страниц списков)

```typescript
// components/admin/PageHeader.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  description: string;
  actionButton?: {
    href: string;
    label: string;
    icon?: React.ReactNode;
  };
}

export const PageHeader = ({ title, description, actionButton }: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>
      {actionButton && (
        <Button asChild className="w-full md:w-auto">
          <Link href={actionButton.href}>
            {actionButton.icon}
            {actionButton.label}
          </Link>
        </Button>
      )}
    </div>
  );
};
```

**Использование:**
```typescript
<PageHeader
  title="Управление услугами"
  description="Создание, редактирование и удаление услуг"
  actionButton={{
    href: '/admin/dashboard/services/new',
    label: 'Создать услугу',
    icon: <Plus className="h-4 w-4 mr-2" />,
  }}
/>
```

### 2.2. FormPageHeader (для страниц создания/редактирования)

```typescript
// components/admin/FormPageHeader.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface FormPageHeaderProps {
  title: string;
  description: string;
  backHref: string;
  backLabel?: string;
}

export const FormPageHeader = ({
  title,
  description,
  backHref,
  backLabel = 'Назад',
}: FormPageHeaderProps) => {
  return (
    <div className="flex flex-col gap-4">
      <Button
        asChild
        variant="ghost"
        className="w-fit border border-border/50 hover:border-border hover:bg-accent"
      >
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backLabel}
        </Link>
      </Button>
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>
    </div>
  );
};
```

**Использование:**
```typescript
<FormPageHeader
  title="Создание услуги"
  description="Заполните форму для создания новой услуги"
  backHref="/admin/dashboard/services"
/>
```

---

## III. ТИПОВЫЕ СТРАНИЦЫ

### 3.1. Страница списка (List Page)

```typescript
// app/admin/dashboard/services/page.tsx
import { Suspense } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { ServicesTable } from '@/components/admin/services-table';
import { ServicesTableSkeleton } from '@/components/admin/ServicesTableSkeleton';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

const ServicesPage = async () => {
  const services = await prisma.service.findMany({
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

### 3.2. Страница создания (Create Page)

```typescript
// app/admin/dashboard/services/new/page.tsx
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

### 3.3. Страница редактирования (Edit Page)

```typescript
// app/admin/dashboard/services/[id]/edit/page.tsx
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

## IV. SHARED COMPONENTS

### 4.1. DeleteDialog

```typescript
// Используйте из @/components/admin/shared
import { DeleteDialog } from '@/components/admin/shared';

<DeleteDialog
  itemId={deletingId}
  itemName={service.name}
  isOpen={!!deletingId}
  isDeleting={isDeleting}
  onClose={() => setDeletingId(null)}
  onConfirm={handleDeleteConfirm}
  title="Удалить услугу?"
/>
```

### 4.2. RowActions

```typescript
// Используйте из @/components/admin/shared
import { RowActions } from '@/components/admin/shared';

<RowActions
  itemId={service.id}
  editHref={`/admin/dashboard/services/${service.id}/edit`}
  onDeleteClick={() => setDeletingId(service.id)}
  isDeleting={isDeleting}
/>
```

### 4.3. TableEmptyState

```typescript
// Используйте из @/components/admin/shared
import { TableEmptyState } from '@/components/admin/shared';

<TableEmptyState 
  colSpan={8} 
  message="Услуги не найдены" 
/>
```

**📖 Подробнее:** См. раздел 8 в [`docs/guidelines/admin_pages/ai_admin_page_components_guidelines.md`](../admin_pages/ai_admin_page_components_guidelines.md)

---

## V. BREAKPOINTS

### 5.1. PageHeader breakpoint

- **Mobile**: < 768px (flex-col, кнопка на всю ширину)
- **Desktop**: ≥ 768px (flex-row, кнопка auto width)

### 5.2. Table breakpoint

- **Mobile**: < 1280px (карточки)
- **Desktop**: ≥ 1280px (таблица)

**📖 Подробнее:** [`docs/guidelines/react/ai_responsive_table_guidelines.md`](../react/ai_responsive_table_guidelines.md)

---

## VI. CHECKLIST

### 6.1. Checklist для админ-страницы

- [ ] **Layout**
  - [ ] AdminSidebar настроен
  - [ ] AdminBreadcrumbs на каждой странице
  - [ ] Адаптивный layout (Sidebar → Drawer на mobile)

- [ ] **Page Component**
  - [ ] PageHeader для списков
  - [ ] FormPageHeader для форм создания/редактирования
  - [ ] Правильный breakpoint (768px для PageHeader)
  - [ ] space-y-6 между секциями

- [ ] **Таблица**
  - [ ] Адаптивная (desktop/mobile views)
  - [ ] Breakpoint 1280px
  - [ ] Drag & drop для сортировки (если нужно)
  - [ ] Shared components используются

- [ ] **Формы**
  - [ ] react-hook-form + Zod
  - [ ] Shadcn UI Form components
  - [ ] Loading state
  - [ ] Error handling
  - [ ] Toast notifications

- [ ] **Общее**
  - [ ] `export const dynamic = 'force-dynamic'`
  - [ ] Suspense для async компонентов
  - [ ] Skeleton для loading states
  - [ ] Типизация TypeScript

---

## VII. СВЯЗАННЫЕ ДОКУМЕНТЫ

- [`docs/guidelines/admin_pages/ai_admin_page_components_guidelines.md`](../admin_pages/ai_admin_page_components_guidelines.md) - **Базовый документ**
- [`docs/guidelines/react/ai_component_guidelines.md`](../react/ai_component_guidelines.md) - Паттерны компонентов
- [`docs/guidelines/react/ai_responsive_table_guidelines.md`](../react/ai_responsive_table_guidelines.md) - Адаптивные таблицы
- [`DRAG_DROP_GUIDELINES.md`](./DRAG_DROP_GUIDELINES.md) - Drag & Drop
- [`FORMS_VALIDATION_GUIDELINES.md`](./FORMS_VALIDATION_GUIDELINES.md) - Формы и валидация
- [`AUTH_GUIDELINES.md`](./AUTH_GUIDELINES.md) - Аутентификация

---

**Версия документа:** 1.0  
**Последнее обновление:** 23.11.2025  
**Статус:** ✅ Актуально

