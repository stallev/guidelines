# Pipeline разработки Next.js webinterfaces

Этот каталог описывает полный production-процесс создания web-интерфейсов уровня premium на базе `Next.js 16+`, `TypeScript`, `Tailwind CSS v4`, `shadcn/ui` и `.pen`-макетов.

## Состав документации

- `00-site-structure-user-flow-architecture.md` - aggregate overview структуры сайта, user flow и architecture
- `09-code-implementation-phases.md` - перечень code-имплементационных фаз (4-8) и входы/выходы
- `01-competitive-serp-and-conversion-research.md` - исследование SERP, интентов и конверсионных паттернов.
- `02-information-architecture-and-content-spec.md` - спецификация IA, user flows и контентной модели.
- `03-pen-design-system-and-page-spec.md` - спецификация `.pen` макетов и дизайн-системы.
- `04-nextjs-implementation-spec.md` - правила реализации на Next.js по Atomic Design.
- `05-ai-design-match-performance-and-qa.md` - AI Design Match, performance и QA-gates.
- `06-premium-pen-and-faang-ux-ui-standards.md` - требования к premium-качеству и FAANG-level UX/UI ориентиры.
- `07-motion-and-microinteractions-guidelines.md` - системные правила motion и microinteractions.
- `08-pagespeed-green-zone-playbook.md` - playbook выхода в Google PageSpeed green zone.
- `templates/` - шаблоны для повторяемого процесса.
- `10-phase-04-nextjs-code-tasks.md` - AI-agent task pack для Phase 04 (Next.js implementation)
- `11-phase-05-qa-performance-tasks.md` - AI-agent task pack для Phase 05 (AI Design Match + QA + perf gates)
- `12-phase-06-premium-ux-ui-tasks.md` - AI-agent task pack для Phase 06 (premium UX/UI compliance)
- `13-phase-07-motion-microinteractions-tasks.md` - AI-agent task pack для Phase 07 (motion + reduced motion)
- `14-phase-08-pagespeed-green-zone-tasks.md` - AI-agent task pack для Phase 08 (PageSpeed green zone release gate)

## Сквозной процесс (wireframes-first)

1. Исследование конкурентов и пользовательских интентов.
2. Подготовка IA и контентной спецификации.
3. Подготовка детализированных wireframes в `md` (`mobile/tablet/desktop`).
4. Проектирование premium `.pen`-макетов на основе wireframes.
5. Реализация страницы в Next.js (mobile-first, Atomic Design).
6. AI Design Match + performance + a11y проверки после каждой страницы.

## Обязательные инварианты

- Для каждой страницы существуют детализированные wireframes в `md` для `mobile`, `tablet`, `desktop`.
- Для каждой страницы в `.pen` есть версии `mobile`, `tablet`, `desktop`.
- В `.pen` есть системные состояния: `empty/loading/error/forbidden` и state-машины критичных элементов управления.
- Токены синхронизированы между `.pen` и кодом через CSS variables и Tailwind v4 `@theme`.
- Реализация соответствует Atomic Design: `atoms -> molecules -> organisms -> templates -> pages`.
- После завершения каждой страницы запускается AI Design Match и quality gates.

## UX/UI policy (premium)

- Базовый ориентир: FAANG-level UX/UI практики.
- `Primary CTA` должен быть консистентен с метаданными wireframe.
- Progressive disclosure обязателен для сложных сценариев.
- Доступность ориентируется на требования уровня WCAG 2.x (минимум AA).
- Motion обязателен как часть UX, с поддержкой `prefers-reduced-motion`.

## Технологическая политика

- **Framework:** `Next.js 16+` (App Router).
- **Язык:** `TypeScript` (strict mode как рекомендуемый стандарт).
- **UI-layer:** `shadcn/ui` как open-code компонентная база.
- **Styling:** `Tailwind CSS v4`, mobile-first, utility-first.
- **SEO/Performance:** metadata API, `next/image`, `next/font`, Core Web Vitals и PageSpeed как KPI.

## Quality policy (общие пороги)

- Structure match `>= 0.90`.
- Token match `>= 0.95`.
- Critical a11y violations `= 0`.
- Contrast AA = pass.
- Core Web Vitals (p75): `LCP <= 2.5s`, `INP <= 200ms`, `CLS <= 0.1`.
- PageSpeed: `>= 90` для mobile и desktop на целевых страницах.
- Нет блокирующих визуальных расхождений выше project threshold.

## Роли

- **Research/Strategy:** анализ конкурентов и конверсионных гипотез.
- **Content/IA:** структура интерфейсов и контентные сценарии.
- **Wireframing:** детализированные `md` wireframes и поведенческие состояния.
- **Design:** `.pen` макеты и система токенов/состояний/motion.
- **Frontend:** реализация Next.js и компонентная архитектура.
- **QA/AI:** автоматические проверки, фиксация дефектов, контроль gates.

## Как проходить pipeline документационно
1. Начинайте с контекста: используйте `00-site-structure-user-flow-architecture.md` как “System overview” для связки route map, user flows и архитектуры.
2. Для каждой страницы проходите последовательность из “Сквозной процесс (wireframes-first)”: wireframes (`md`) -> `.pen` -> реализация Next.js.
3. Для фаз code-имплементации (4-8) используйте соответствующие AI task packs (`10-*..14-*`) как список задач, где каждая задача оформлена как промпт для AI-агента и содержит AcceptanceCriteria + References.
4. После каждой страницы закрывайте quality через `05-*` и release gate через `08-*`.
