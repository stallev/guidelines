# General Guidelines for Next.js Projects

## Версия документа: 1.0
**Дата создания:** 23.11.2025  
**Проект:** Landing Page + Admin Dashboard  
**Назначение:** Общие руководства для создания Next.js проектов

---

## 📚 Доступные Guidelines

Этот каталог содержит comprehensive руководства по всем аспектам разработки Next.js приложений с использованием современного стека технологий.

### 🏗️ Архитектура и Core

#### 1. [Architecture Guidelines](./ARCHITECTURE_GUIDELINES.md)
**Архитектурные паттерны проекта**

Ключевые концепции:
- Двухслойная структура (Public Pages + Admin Dashboard)
- Server-First Architecture (RSC по умолчанию)
- Полная типобезопасность (TypeScript + Zod + Prisma)
- State Management (минимальное использование клиентского state)
- Error Handling (Error Boundaries, Try-Catch)
- Performance Optimization (React Compiler)
- Caching Strategies (React cache, Next.js ISR)

#### 2. [Server Actions Guidelines](./SERVER_ACTIONS_GUIDELINES.md)
**Работа с Server Actions**

Ключевые концепции:
- Структура Server Action (директива 'use server')
- Zod schemas для валидации
- Discriminated unions для результатов
- Аутентификация в Server Actions
- FormData обработка
- Revalidation (revalidatePath, revalidateTag)
- Comprehensive error handling

#### 3. [Database Guidelines](./DATABASE_GUIDELINES.md)
**Работа с Prisma ORM и PostgreSQL**

Ключевые концепции:
- Prisma Client (единый экземпляр)
- CRUD операции (Create, Read, Update, Delete)
- Relations (One-to-Many, One-to-One, Many-to-Many)
- Продвинутые запросы (фильтрация, агрегация)
- Транзакции (Interactive, Sequential)
- Типы данных (Decimal, DateTime)
- Миграции и Seed данные
- Индексы и оптимизация

---

### 🎨 UI/UX Components

#### 4. [UI Components Guidelines](./UI_COMPONENTS_GUIDELINES.md)
**Создание UI компонентов с Shadcn UI**

Ключевые концепции:
- Shadcn UI компоненты (Button, Form, Dialog, Card, Table)
- Tailwind CSS utility-first подход
- Адаптивный дизайн (breakpoints, mobile-first)
- Семантические цвета (primary, secondary, destructive)
- Accessibility (ARIA, keyboard navigation)
- Toast notifications (Sonner)

#### 5. [Forms & Validation Guidelines](./FORMS_VALIDATION_GUIDELINES.md)
**Формы и валидация данных**

Ключевые концепции:
- Zod schemas (единый источник истины)
- react-hook-form (управление формами)
- Shadcn UI Form components
- Типы полей (Input, Textarea, Select, Checkbox, File)
- Валидация в реальном времени
- Состояния формы (loading, dirty, errors)
- Оптимизация форм

#### 6. [Responsive Design Guidelines](./RESPONSIVE_DESIGN_GUIDELINES.md)
**Адаптивный дизайн**

Ключевые концепции:
- Mobile-first подход
- Tailwind breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- Адаптивные компоненты (Desktop/Mobile views)
- Адаптивная типографика
- Touch-friendly интерфейсы

---

### 🔐 Authentication & Security

#### 7. [Authentication Guidelines](./AUTH_GUIDELINES.md)
**Аутентификация с Auth.js v5**

Ключевые концепции:
- Auth.js setup (Credentials provider)
- Проверка аутентификации (Server Components, Server Actions, Client Components)
- Login page (форма входа)
- Logout (Sign Out button)
- Middleware (защита маршрутов)
- TypeScript types расширение

---

### 📁 Media & Files

#### 8. [Media Upload Guidelines](./MEDIA_UPLOAD_GUIDELINES.md)
**Загрузка и управление медиа-файлами**

Ключевые концепции:
- Supabase Storage setup (S3 Client)
- File upload (валидация, обработка)
- Media Library (аналог WordPress)
- Server Actions для upload
- Image optimization

---

### 🎯 Admin Dashboard

#### 9. [Admin Dashboard Guidelines](./ADMIN_DASHBOARD_GUIDELINES.md)
**Создание админ-панелей** ⭐

Ключевые концепции:
- Admin Layout (Sidebar, Breadcrumbs)
- Page Components (PageHeader, FormPageHeader)
- Типовые страницы (List, Create, Edit)
- Shared Components (DeleteDialog, RowActions, TableEmptyState)
- Breakpoints (PageHeader: 768px, Tables: 1280px)

#### 10. [Drag & Drop Guidelines](./DRAG_DROP_GUIDELINES.md)
**Drag & Drop для таблиц** ⭐

Ключевые концепции:
- @dnd-kit библиотеки (core, sortable, utilities)
- Структура компонента (DndContext, SortableContext, useSortable)
- Shared Components (DragHandle, ReorderingOverlay)
- Server Action для reorder
- Optimistic updates с rollback
- Mobile support (touch gestures)
- Accessibility (keyboard navigation)

---

### ⚡ Performance & SEO

#### 11. [Performance Guidelines](./PERFORMANCE_GUIDELINES.md)
**Оптимизация производительности**

Ключевые концепции:
- React Compiler (автоматическая оптимизация)
- Image Optimization (next/image)
- Dynamic Imports (lazy loading)
- Caching Strategies (ISR, force-dynamic)
- Bundle optimization

#### 12. [SEO Guidelines](./SEO_GUIDELINES.md)
**SEO оптимизация**

Ключевые концепции:
- Metadata (title, description, keywords)
- Open Graph tags
- Sitemap.xml
- Robots.txt
- Structured Data (Schema.org)

---

### 🚀 Deployment

#### 13. [Deployment Guidelines](./DEPLOYMENT_GUIDELINES.md)
**Деплой на Vercel**

Ключевые концепции:
- Vercel setup
- Environment variables
- Build configuration
- Prisma migrations
- Post-deployment checklist

---

## 🎯 Ключевые принципы

Все guidelines следуют этим core принципам:

1. **Server-First**: Максимум на сервере, минимум на клиенте
2. **Type Safety**: TypeScript + Zod + Prisma для полной типобезопасности
3. **Component-Driven**: Atomic Design, переиспользуемые компоненты
4. **Accessibility**: WCAG 2.1 AA compliance
5. **Performance**: React Compiler, Image Optimization, Caching
6. **Mobile-First**: Адаптивный дизайн для всех устройств

---

## 🔗 Обязательные связи

### При создании компонентов
- **ВСЕГДА** следовать [`docs/guidelines/react/ai_component_guidelines.md`](../react/ai_component_guidelines.md)
- При создании hooks - [`docs/guidelines/react/ai_react_hooks_guidelines.md`](../react/ai_react_hooks_guidelines.md)
- При создании utilities - [`docs/guidelines/react/ai_react_utilities_guidelines.md`](../react/ai_react_utilities_guidelines.md)
- При создании таблиц - [`docs/guidelines/react/ai_responsive_table_guidelines.md`](../react/ai_responsive_table_guidelines.md)

---

## 📖 Использование

### Для разработчиков:
1. **Начать с архитектуры** - изучить [Architecture Guidelines](./ARCHITECTURE_GUIDELINES.md)
2. **Выбрать нужный guideline** - в зависимости от задачи
3. **Следовать checklist** - в конце каждого документа
4. **Ссылаться на связанные документы** - для полного понимания

### Для AI агентов:
1. **Автоматически определять** тип задачи
2. **Применять соответствующий guideline**
3. **Проверять все связанные guidelines**
4. **Следовать всем checklists**

---

## 📚 Полный список документов

1. ✅ [ARCHITECTURE_GUIDELINES.md](./ARCHITECTURE_GUIDELINES.md) - Архитектура
2. ✅ [SERVER_ACTIONS_GUIDELINES.md](./SERVER_ACTIONS_GUIDELINES.md) - Server Actions
3. ✅ [DATABASE_GUIDELINES.md](./DATABASE_GUIDELINES.md) - Prisma & БД
4. ✅ [UI_COMPONENTS_GUIDELINES.md](./UI_COMPONENTS_GUIDELINES.md) - UI компоненты
5. ✅ [FORMS_VALIDATION_GUIDELINES.md](./FORMS_VALIDATION_GUIDELINES.md) - Формы
6. ✅ [AUTH_GUIDELINES.md](./AUTH_GUIDELINES.md) - Аутентификация
7. ✅ [MEDIA_UPLOAD_GUIDELINES.md](./MEDIA_UPLOAD_GUIDELINES.md) - Медиа файлы
8. ✅ [ADMIN_DASHBOARD_GUIDELINES.md](./ADMIN_DASHBOARD_GUIDELINES.md) - Админ-панель
9. ✅ [DRAG_DROP_GUIDELINES.md](./DRAG_DROP_GUIDELINES.md) - Drag & Drop
10. ✅ [RESPONSIVE_DESIGN_GUIDELINES.md](./RESPONSIVE_DESIGN_GUIDELINES.md) - Адаптивность
11. ✅ [PERFORMANCE_GUIDELINES.md](./PERFORMANCE_GUIDELINES.md) - Производительность
12. ✅ [SEO_GUIDELINES.md](./SEO_GUIDELINES.md) - SEO
13. ✅ [DEPLOYMENT_GUIDELINES.md](./DEPLOYMENT_GUIDELINES.md) - Деплой

---

## 🤝 Интеграция с React Guidelines

Эти guidelines тесно интегрированы с React Guidelines:

- [`docs/guidelines/react/ai_component_guidelines.md`](../react/ai_component_guidelines.md) - **ОБЯЗАТЕЛЬНО** для всех компонентов
- [`docs/guidelines/react/ai_react_hooks_guidelines.md`](../react/ai_react_hooks_guidelines.md) - Hooks
- [`docs/guidelines/react/ai_react_utilities_guidelines.md`](../react/ai_react_utilities_guidelines.md) - Utilities
- [`docs/guidelines/react/ai_responsive_table_guidelines.md`](../react/ai_responsive_table_guidelines.md) - Таблицы
- [`docs/guidelines/react/ai_drag_drop_guidelines.md`](../react/ai_drag_drop_guidelines.md) - Drag & Drop

---

**Версия документа:** 1.0  
**Последнее обновление:** 23.11.2025  
**Проект:** Landing Page + Admin Dashboard  
**Локация:** Могилёв, Беларусь 🇧🇾

---

> ✅ **Эти guidelines обеспечивают полный набор best practices** для создания production-ready Next.js приложений с современным стеком технологий.

