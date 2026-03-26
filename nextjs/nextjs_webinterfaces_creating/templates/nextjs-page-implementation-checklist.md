# Шаблон: Next.js page implementation checklist

## 1. Базовая информация

- Страница:
- Route:
- Ответственный:
- Дата:
- Wireframe `md`:
- `.pen` spec:
- Primary CTA:

## 2. Архитектура и Atomic Design

- [ ] Компоненты разложены по `atoms/molecules/organisms/templates`.
- [ ] Нет неоправданно крупных client-компонентов.
- [ ] Страница собрана из template+organisms, а не из хаотичного набора блоков.
- [ ] Соответствие структуре wireframe подтверждено.

## 3. Next.js 16+ стандарты

- [ ] App Router conventions соблюдены.
- [ ] `params/searchParams` обрабатываются корректно (async для Next.js 16+).
- [ ] Используется корректная cache strategy (`force-cache`/`no-store`/`revalidate`).
- [ ] При инвалидации кэша применены `revalidateTag(tag, profile)` или `updateTag(tag)`.

## 4. Tailwind v4 и токены

- [ ] Токены описаны через `@theme` (где требуется utility mapping).
- [ ] Стили mobile-first.
- [ ] Нет BEM.
- [ ] Состояния компонентов совпадают с `.pen`.
- [ ] State coverage включает `empty/loading/error/forbidden`.

## 5. shadcn/ui

- [ ] Используются компоненты как open-code база.
- [ ] Композиция компонентов консистентна.
- [ ] Диалоги/формы имеют нужные a11y-элементы.

## 6. Performance и SEO

- [ ] Изображения через `next/image`.
- [ ] Шрифты через `next/font`.
- [ ] Metadata/OG заполнены.
- [ ] Нет явных блокеров LCP/INP/CLS.
- [ ] PageSpeed mobile >= 90.
- [ ] PageSpeed desktop >= 90.

## 7. Motion и reduced motion

- [ ] Motion-сценарии реализованы в соответствии со спецификацией.
- [ ] Предпочтительно используются `transform/opacity` для анимаций.
- [ ] Реализован `prefers-reduced-motion` fallback.
- [ ] Анимации не создают деградацию INP/CLS.

## 8. QA и приемка

- [ ] AI Design Match запущен.
- [ ] A11y-проверка пройдена.
- [ ] Performance gates пройдены.
- [ ] Итоговый статус страницы: `pass`.
