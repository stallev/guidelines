# SEO Guidelines

## Версия документа: 1.0
**Дата создания:** 23.11.2025

---

## 📋 О документе

Best practices для SEO оптимизации Next.js приложения.

---

## I. METADATA

```typescript
// app/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Электрик в Могилёве | Электромонтажные работы',
  description: 'Профессиональные электромонтажные работы в Могилёве',
  keywords: ['электрик', 'Могилёв', 'электромонтаж'],
  openGraph: {
    title: 'Электрик в Могилёве',
    description: 'Профессиональные электромонтажные работы',
    url: 'https://electrician.by',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
};
```

---

## II. SITEMAP

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://electrician.by',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://electrician.by/services',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}
```

---

## III. STRUCTURED DATA

```typescript
export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Электрик в Могилёве',
    description: 'Профессиональные электромонтажные работы',
    url: 'https://electrician.by',
    telephone: '+375291234567',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Могилёв',
      addressCountry: 'BY',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Content */}
    </>
  );
}
```

---

## IV. CHECKLIST

- [ ] Metadata для всех страниц
- [ ] Open Graph tags
- [ ] Sitemap.xml
- [ ] Robots.txt
- [ ] Structured data (Schema.org)
- [ ] Alt text для изображений
- [ ] Semantic HTML

---

**Версия:** 1.0 | **Статус:** ✅ Актуально

