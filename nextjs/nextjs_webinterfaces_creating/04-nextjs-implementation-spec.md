# Этап 4. Next.js implementation specification

## Цель этапа

Реализовать страницу в `Next.js 16+` с 1:1 соответствием `.pen`-макету, соблюдая Atomic Design, performance и accessibility требования.

## Стек и стандарты

- `Next.js 16+` (App Router).
- `TypeScript` для всех компонентов и доменных типов.
- `Tailwind CSS v4` как основной способ стилизации.
- `shadcn/ui` как основа компонентной библиотеки.
- Atomic Design как архитектура UI-слоя.

## Архитектурные правила (Next.js best practices)

### Server/Client boundaries

- По умолчанию используйте Server Components.
- `use client` добавляйте только интерактивным компонентам.
- Не переносите крупные деревья в client-side без необходимости.
- Минимизируйте shipped JS: локализуйте интерактивность в небольших client islands.

### Data fetching и cache strategy

- Для статичных данных: `fetch(..., { cache: 'force-cache' })`.
- Для динамичных данных: `cache: 'no-store'`.
- Для управляемого TTL: `next: { revalidate: N }`.
- Для тегированных инвалидаций применяйте `revalidateTag(tag, profile)` или `updateTag(tag)` в Server Actions.
- Для персонализированных зон используйте streaming и явные `Suspense` fallback.

### App Router conventions

- Структура маршрутов должна совпадать с route map этапа 2.
- Metadata и OG-данные задаются через API App Router.
- Роуты и layout-уровни должны быть предсказуемы и минимальны.

## Atomic Design в коде

Рекомендуемая структура:

- `src/components/atoms/*`
- `src/components/molecules/*`
- `src/components/organisms/*`
- `src/components/templates/*`
- `src/app/**/page.tsx` как уровень `pages`

Компоненты shadcn/ui адаптируются под дизайн-токены проекта и оборачиваются при необходимости в `atoms/molecules`.

## Tailwind v4 и токены

- Используйте `@theme` для токенов, которые должны маппиться в utility-классы.
- Используйте CSS variables для токенов runtime и интеграции с `.pen` styleguide.
- Подход mobile-first обязателен.
- BEM не используется.

## Performance и accessibility по умолчанию

- Изображения только через `next/image` с корректными размерами.
- Шрифты через `next/font` (self-hosted или Google через встроенный loader).
- Интерактивные элементы доступны с клавиатуры и имеют корректные состояния focus.
- Диалоги/формы/навигация соответствуют a11y требованиям (включая доступные title/label/description).
- Для критичного above-the-fold контента соблюдайте LCP-friendly загрузку (без тяжелого client JS и лишних блокирующих ресурсов).

## Motion implementation policy

- Анимации реализуются как часть UX-поведения, а не декоративный слой.
- Предпочтительно анимировать `transform` и `opacity`.
- Избегать частых layout-trigger анимаций в критичных UI-регионах.
- Обязательно поддерживать `prefers-reduced-motion` и безопасный fallback.
- Проверять, что motion не ухудшает `INP` и не создает layout shifts (`CLS`).

## Wireframes-first реализация

- Разработка начинается с валидации соответствия wireframe `mobile/tablet/desktop`.
- Любое структурное отклонение от wireframe фиксируется и согласуется до мерджа.
- `Primary CTA` в коде должен соответствовать `Primary CTA` wireframe metadata.

## Рабочий цикл по странице

1. Сверить wireframe `mobile/tablet/desktop` и `.pen` mapping.
2. Собрать page template и organisms по Atomic Design.
3. Реализовать адаптив, системные состояния и взаимодействия.
4. Подключить metadata, image/font optimization, cache strategy, streaming fallback.
5. Реализовать motion-сценарии и reduced-motion fallback.
6. Прогнать AI Design Match + quality checks.
7. Исправить расхождения до прохождения gates.

## Критерии готовности

- Страница соответствует `.pen` визуально и структурно.
- Все состояния и сценарии реализованы.
- Нет критичных проблем по a11y/performance.
- Страница прошла AI Design Match и quality gates.
- Выполнены PageSpeed green-zone требования для целевых страниц.
