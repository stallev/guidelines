# Performance Optimization Guidelines

## Версия документа: 1.0
**Дата создания:** 23.11.2025

---

## 📋 О документе

Best practices для оптимизации производительности Next.js приложения.

---

## I. REACT COMPILER

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    reactCompiler: true, // ✅ Автоматическая оптимизация
  },
};
```

---

## II. IMAGE OPTIMIZATION

```typescript
import Image from 'next/image';

// ✅ Оптимизированные изображения
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority  // Для above-the-fold изображений
  placeholder="blur"
  blurDataURL="data:image/..."
/>

// Responsive images
<Image
  src={service.image}
  alt={service.name}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>
```

---

## III. DYNAMIC IMPORTS

```typescript
import dynamic from 'next/dynamic';

// ✅ Lazy loading для больших компонентов
const OrderModal = dynamic(() => import('@/components/landing/OrderModal'), {
  loading: () => <Skeleton />,
  ssr: false,
});

const AdminDashboard = dynamic(
  () => import('@/components/admin/Dashboard'),
  { loading: () => <DashboardSkeleton /> }
);
```

---

## IV. CACHING STRATEGIES

```typescript
// ISR (Incremental Static Regeneration)
export const revalidate = 3600; // Revalidate каждый час

// Force dynamic
export const dynamic = 'force-dynamic';

// React cache для дедупликации
import { cache } from 'react';

export const getServices = cache(async () => {
  return await prisma.service.findMany();
});
```

---

## V. CHECKLIST

- [ ] React Compiler включен
- [ ] next/image для всех изображений
- [ ] Dynamic imports для больших компонентов
- [ ] Caching strategy определена
- [ ] Bundle size проверен

---

**Версия:** 1.0 | **Статус:** ✅ Актуально

