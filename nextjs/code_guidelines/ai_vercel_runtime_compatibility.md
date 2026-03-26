# Vercel Runtime Compatibility for Next.js (Current Stable)

## Document Version: 3.0

## Purpose

Этот guideline фиксирует безопасный baseline для проектов на Next.js App Router при деплое на Vercel.

## Applies To

- Проекты на Next.js App Router, развернутые на Vercel.
- Технические решения по рендерингу, кешированию, стримингу и ограничениям платформы.

## Rules

1. Используйте подходы, описанные в официальной документации **current stable Next.js**.
2. Для loading UX применяйте `loading.tsx` и `Suspense` как стандартный механизм стриминга.
3. Для инвалидации кеша выбирайте API по назначению:
   - `updateTag` для read-your-own-writes;
   - `revalidateTag` для tag-based stale-while-revalidate;
   - `revalidatePath` для path-scoped invalidation.
4. Не переносите ограничения других хостингов в Vercel-runtime политику.
5. Не фиксируйте hardcoded platform limits в тексте; всегда ссылайтесь на актуальную страницу лимитов.

## Recommended Baseline

- App Router, Server Components, Client Components, Route Handlers.
- Turbopack как базовый bundler для dev/build, если нет явно документированной причины использовать альтернативу.
- Image Optimization через `next/image` в рамках ограничений Next.js/Vercel.

## Official References

- Next.js App Router: [https://nextjs.org/docs/app](https://nextjs.org/docs/app)
- Loading UI and Streaming: [https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- Caching and Revalidating: [https://nextjs.org/docs/app/getting-started/caching-and-revalidating](https://nextjs.org/docs/app/getting-started/caching-and-revalidating)
- Vercel Limits: [https://vercel.com/docs/limits](https://vercel.com/docs/limits)
