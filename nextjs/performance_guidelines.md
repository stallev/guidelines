# ⚡ Performance Guidelines
**For "Behold Your God" Project**  
*Next.js App Router v15.5+ • TypeScript • FSD + Atomic Design • AWS Amplify Stack*

> **Purpose**: This document defines **performance optimization strategies** for the "Behold Your God" platform, ensuring fast load times, excellent Core Web Vitals, and optimal user experience across all devices.

---

## 1. 🎯 Performance Targets

### Core Web Vitals (WCAG 2.1 AA + Performance)
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms  
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTFB (Time to First Byte)**: < 600ms (global CDN via CloudFront)

### Additional Metrics
- **Time to Interactive (TTI)**: < 3.5s on 3G
- **Total Bundle Size**: < 250 KB (initial load, gzipped)
- **Lighthouse Score**: 90+ for Performance, Accessibility, Best Practices, SEO

---

## 2. 🏗️ Rendering Strategy (Next.js App Router)

### 2.1 Default: Static Site Generation (SSG)
**Use for:**
- Public content pages (hubs, topics, library)
- Post detail pages
- Home page

**Implementation:**
```typescript
// app/post/[slug]/page.tsx
export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await fetchPost(params.slug); // Server Component
  return <PostContent post={post} />;
}

// Enable ISR for dynamic updates
export const revalidate = 3600; // Revalidate every hour
```

### 2.2 Incremental Static Regeneration (ISR)
**Use for:**
- Content that updates periodically (new posts, categories)
- Library filters with recent content

**Implementation:**
```typescript
export const revalidate = 1800; // 30 minutes
```

### 2.3 Server-Side Rendering (SSR)
**Use for:**
- Admin Panel pages with user-specific data
- Search results (personalized)
- Real-time admin dashboards

**Implementation:**
```typescript
// app/admin/dashboard/page.tsx
export const dynamic = 'force-dynamic'; // Disable caching
```

### 2.4 Client-Side Rendering (CSR)
**Use sparingly:**
- Interactive components only (`'use client'`)
- Forms, modals, dropdowns
- React Query-powered admin UIs

---

## 3. 📦 Code Splitting & Lazy Loading

### 3.1 Dynamic Imports for Heavy Components
```typescript
// Lazy load WYSIWYG editor (large dependency)
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/shared/ui/molecules/RichTextEditor'), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false, // Client-only component
});

// Usage in post creation form
<RichTextEditor value={content} onChange={setContent} />
```

### 3.2 Route-Level Code Splitting
Next.js automatically splits code by route. Keep pages focused:
- ✅ Small, focused pages (< 100 KB per route)
- ❌ Avoid importing entire feature modules at page level

### 3.3 Component-Level Splitting
```typescript
// Lazy load video player (only when needed)
const VideoPlayer = dynamic(() => import('@/widgets/video-player/ui/VideoPlayer'), {
  loading: () => <div className="aspect-video bg-muted animate-pulse" />,
});

// Conditionally render based on post format
{post.format === 'Video' && <VideoPlayer url={post.videoUrl} />}
```

---

## 4. 🖼️ Image Optimization

### 4.1 Use Next.js `<Image>` Component
```typescript
import Image from 'next/image';

<Image
  src={post.coverImageS3Url}
  alt={post.title}
  width={1200}
  height={630}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={isAboveFold} // For hero images
  placeholder="blur"
  blurDataURL={post.blurHash} // Generated on upload
/>
```

### 4.2 Responsive Images with `sizes`
```typescript
// Hero image (above fold)
sizes="100vw"

// Post card in grid
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
```

### 4.3 S3 Image Optimization
Use AWS Lambda@Edge or CloudFront Functions to:
- Auto-resize images based on query params
- Serve WebP format for supported browsers
- Add `Cache-Control` headers for optimal caching

---

## 5. 🗂️ Bundle Analysis & Optimization

### 5.1 Analyze Bundle Size
```bash
npm run build
npx @next/bundle-analyzer
```

Add to `next.config.ts`:
```typescript
import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default bundleAnalyzer({
  // ... your config
});
```

Run: `ANALYZE=true npm run build`

### 5.2 Optimize Dependencies
- ✅ Import only what you need:
  ```typescript
  // Bad
  import { format, parse, add, sub } from 'date-fns';
  
  // Good
  import format from 'date-fns/format';
  import parseISO from 'date-fns/parseISO';
  ```

- ✅ Replace heavy libraries:
  - Use `date-fns` instead of `moment` (70% smaller)
  - Use `zod` instead of `yup` (smaller, faster)

### 5.3 Tree Shaking
Ensure proper exports in all modules:
```typescript
// Good (named exports - tree-shakable)
export const Button = () => { ... };
export const Input = () => { ... };

// Bad (default export - harder to tree-shake)
export default { Button, Input };
```

---

## 6. 🚀 Caching Strategy

### 6.1 HTTP Caching (CloudFront)
Configure in AWS Amplify Hosting:
```yaml
# amplify.yml
customHeaders:
  - pattern: '**/*.{js,css,png,jpg,jpeg,webp,svg,woff2}'
    headers:
      - key: Cache-Control
        value: public, max-age=31536000, immutable
```

### 6.2 Next.js Data Caching
```typescript
// Cache GraphQL queries
const posts = await fetch('https://graphql.example.com', {
  next: {
    revalidate: 3600, // 1 hour
    tags: ['posts'], // For revalidateTag()
  },
});

// On-demand revalidation in Server Actions
import { revalidateTag, revalidatePath } from 'next/cache';

revalidateTag('posts');
revalidatePath('/library');
```

### 6.3 React Query Caching (Admin Panel)
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

---

## 7. 🎨 CSS & Styling Performance

### 7.1 Tailwind CSS Optimization
Ensure purging is enabled (default in v4):
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  // Tailwind v4 auto-purges unused classes
};
```

### 7.2 Avoid Inline Styles
```typescript
// Bad (prevents CSS optimization)
<div style={{ color: 'red', fontSize: '16px' }} />

// Good (uses Tailwind classes)
<div className="text-red-500 text-base" />
```

### 7.3 Critical CSS
Next.js automatically inlines critical CSS. Ensure components use Tailwind classes for optimal extraction.

---

## 8. 📊 Monitoring & Observability

### 8.1 Real User Monitoring (RUM)
Use Vercel Analytics or AWS CloudWatch RUM:
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 8.2 Lighthouse CI *(Post-MVP)*
**MVP Approach**: Run Lighthouse manually in Chrome DevTools

**Post-MVP**: Add to GitHub Actions:
```yaml
# .github/workflows/lighthouse.yml
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@v9
  with:
    urls: |
      https://staging.example.com
      https://staging.example.com/library
    uploadArtifacts: true
```

### 8.3 Performance Budgets
Set budgets in `next.config.ts`:
```typescript
export default {
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
  // Warn if bundle size exceeds limits
  webpack: (config) => {
    config.performance = {
      maxAssetSize: 250000, // 250 KB
      maxEntrypointSize: 250000,
    };
    return config;
  },
};
```

---

## 9. 🔧 AWS-Specific Optimizations

### 9.1 AppSync Query Optimization
- Use `@connection` directives for efficient joins
- Implement pagination for large lists:
  ```graphql
  query ListPosts($limit: Int, $nextToken: String) {
    listPosts(limit: $limit, nextToken: $nextToken) {
      items { id title }
      nextToken
    }
  }
  ```

### 9.2 DynamoDB Indexing
- Create GSIs for common queries (by category, by date)
- Use composite sort keys for efficient filtering

### 9.3 S3 Performance
- Enable CloudFront for global CDN
- Use Transfer Acceleration for uploads from admin panel
- Compress assets before upload (Gzip/Brotli)

---

## 10. 🤖 AI Assistant Instructions

When optimizing performance:

1. **Always prefer Server Components** unless interactivity is required
2. **Use dynamic imports** for components > 50 KB
3. **Add `priority` to above-fold images**
4. **Set `revalidate` for SSG pages**
5. **Use React Query with proper cache times** in admin
6. **Avoid client-side data fetching** on public pages
7. **Check bundle size** after adding new dependencies

> 💡 **Prompt example**:  
> _"Optimize this post listing page for performance using SSG with ISR, Next.js Image, and proper caching strategies."_

---

## 11. 📚 References

- [Next.js Performance Documentation](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Core Web Vitals](https://web.dev/vitals/)
- [AWS CloudFront Best Practices](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/best-practices.html)
- [React Query Performance](https://tanstack.com/query/latest/docs/react/guides/performance)

---

> ✅ **This document is the single source of truth for performance optimization in "Behold Your God."**  
> 🔄 Update it as new patterns emerge or technologies evolve.

