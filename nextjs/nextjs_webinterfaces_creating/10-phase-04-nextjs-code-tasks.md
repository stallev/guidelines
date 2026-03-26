---
title: "Phase 04: Next.js code tasks (AI-agent prompt pack)"
stage: "Code implementation"
audience: ["AI Agents", "Frontend", "Tech Writers"]
---

## Goal of Phase 04
Перевести wireframe регионы и `.pen` page spec в реализацию Next.js 16+ (App Router) с Atomic Design, соблюдая server/client границы, cache/streaming правила, metadata API и motion policy.

## How to use
Каждый раздел ниже — это отдельная задача для AI агента.

Для каждой задачи заполняйте/используйте:
- конкретный deliverable (что агент должен вернуть в виде текста/чеклиста/инструкции)
- критерии `AcceptanceCriteria` (что считается выполненным)
- `References` (файлы и секции из каталога)

## Task Pack (10 tasks)

### Task 04.1 — Validate inputs & prepare page mapping checklist
**AI Agent Prompt**
См. шаблон: `templates/ai-agent-task-prompt-template.md`.

You are an expert implementation/documentation agent for `nextjs_webinterfaces_creating`.

## Role
Senior Fullstack Developer + Technical Writer.

## Goal
Собрать checklist входных артефактов и инвариантов для конкретной страницы перед стартом Phase 04 и зафиксировать “what is in scope / out of scope”.

## Inputs
- `02-information-architecture-and-content-spec.md` (route map + page brief expectations)
- Wireframes markdown (mobile/tablet/desktop) via `templates/wireframes-mobile-tablet-desktop-template.md`
- `03-pen-design-system-and-page-spec.md` (required states/tokens/mapping rules)
- `.pen` page spec

## Steps
1. Сверить наличие route map entry и цели страницы.
2. Составить список обязательных wireframe regions для mobile/tablet/desktop.
3. Составить список required production states (page-level + controls-level).
4. Зафиксировать Primary CTA и constraints по терминологии.
5. Выдать “готово к Phase 04” checklist.

## Constraints / Guardrails
- Нельзя начинать код до того, как известны регионы, Primary CTA, state-машины и mapping правила.
- References должны быть конкретными по секциям.

## Expected Output
1) Deliverable Summary
2) Checklist of Work Items
3) Implementation Notes
4) QA/Validation Plan (коротко: когда запускать Phase 5/quality gates)
5) Risks & Open Questions

## AcceptanceCriteria
- Список inputs включает IA+wireframes+.pen, а также checklist required states.
- Primary CTA и его позиция в wireframe зафиксированы.
- Есть явная секция “дальше в Phase 05” (что именно будет проверено AI Design Match).

## References
- [`02-information-architecture-and-content-spec.md`](02-information-architecture-and-content-spec.md) — sections: sitemap/route map, page brief
- [`03-pen-design-system-and-page-spec.md`](03-pen-design-system-and-page-spec.md) — sections: production states, wireframe->.pen mapping, design token requirements
- [`06-premium-pen-and-faang-ux-ui-standards.md`](06-premium-pen-and-faang-ux-ui-standards.md) — sections: production states, Primary CTA policy
- [`templates/wireframes-mobile-tablet-desktop-template.md`](templates/wireframes-mobile-tablet-desktop-template.md) — sections: regions, states, component mapping

### Task 04.2 — Align wireframe regions ↔ .pen regions ↔ Atomic mapping
**AI Agent Prompt**
## Goal
Построить верифицируемую карту соответствия:
`wireframe region id (M/T/D) -> expected .pen node/group -> expected Atomic Design level + компонентная роль`.

## Inputs
- Wireframes (mobile/tablet/desktop)
- `.pen` page spec (regions + node naming / mapping expectations)

## Steps
1. Для каждого региона выбрать expected Atomic level (atom/molecule/organism/template/page).
2. Отметить различия mobile/tablet/desktop (где разрешено) и “must be identical” правила.
3. Вывести таблицу mapping и список рисков (ambiguities).
4. Подготовить список “needs clarification” вопросов для Design/PM/Tech.

## Constraints / Guardrails
- Не допускайте structural deviations: если region отличается, это превращается в issue/risk, а не “тихо меняем”.

## Expected Output
- Таблица mapping по всем breakpoint-версиям.

## AcceptanceCriteria
- Каждая M/T/D region покрыта mapping-строкой.
- Primary CTA и overlay regions (если есть) имеют отдельные строки.
- Есть список рисков с приоритетом.

## References
- [`templates/wireframes-mobile-tablet-desktop-template.md`](templates/wireframes-mobile-tablet-desktop-template.md) — sections: layout map, component mapping, cross-breakpoint rules
- [`03-pen-design-system-and-page-spec.md`](03-pen-design-system-and-page-spec.md) — sections: Atomic mapping, wireframe->.pen mapping
- [`06-premium-pen-and-faang-ux-ui-standards.md`](06-premium-pen-and-faang-ux-ui-standards.md) — sections: production states, naming conventions (if applicable)

### Task 04.3 — Propose Atomic Design folder structure for this page
**AI Agent Prompt**
## Goal
Сформировать folder structure под Atomic Design для компонентов конкретной страницы так, чтобы она соответствовала `.pen` mapping и Next.js routing.

## Inputs
- Atomic mapping из Task 04.2
- список expected компонентов (atoms/molecules/organisms/templates)

## Steps
1. Определить, какие блоки будут `atoms`, какие — `molecules`, какие — `organisms`, и где будет `template`.
2. Предложить структуру файлов для переиспользования (минимизация дублирования).
3. Определить “client islands” кандидаты: где точно нужен `use client`.
4. Сформировать checklist на соответствие `04-nextjs-implementation-spec.md` boundaries.

## AcceptanceCriteria
- Есть четкая схема: `atoms/molecules/organisms/templates` + где в `src/app/**/page.tsx`.
- `use client` показан только для интерактивных частей.

## References
- [`04-nextjs-implementation-spec.md`](04-nextjs-implementation-spec.md) — sections: Server/Client boundaries, Atomic Design in code, motion policy expectations
- [`09-code-implementation-phases.md`](09-code-implementation-phases.md) — sections: Phase 4 outputs (where code artifacts live)

### Task 04.4 — Implement page.tsx composition with server-first boundaries
**AI Agent Prompt**
## Goal
Описать реализацию `page.tsx` (App Router) как композицию `template + organisms` по Atomic Design с server-first архитектурой.

## Inputs
- Proposed folder structure (Task 04.3)
- Mapping table (Task 04.2)

## Steps
1. Дать рекомендацию по компонентному дереву (какие компоненты “server”, какие “client”).
2. Указать, как подцепляются props/children и как не тащить крупные деревья в client.
3. Описать обработку входных параметров `params/searchParams` (как async for Next.js 16+).
4. Указать точки, где применяются Suspense fallbacks (если async regions есть).

## AcceptanceCriteria
- Серверные компоненты по умолчанию.
- Нет крупного client-side дерева без необходимости.
- async params/searchParams описаны корректно.

## References
- [`04-nextjs-implementation-spec.md`](04-nextjs-implementation-spec.md) — sections: Server/Client boundaries, App Router conventions

### Task 04.5 — Implement metadata API + OG fields
**AI Agent Prompt**
## Goal
Сгенерировать plan реализации SEO/metadata через metadata API App Router и обеспечить соответствие title/H1-H3/primary intent полям из page brief.

## Inputs
- page brief expectations from `02-*` (SEO fields)
- route mapping (URL/slug)

## Steps
1. Уточнить required metadata поля для страницы.
2. Предложить `export const metadata`/metadata functions по App Router.
3. Описать требования к OG image/title/description (в зависимости от brief).
4. Проверить соответствие Primary CTA терминологии/ожиданиям.

## AcceptanceCriteria
- Метаданные представлены через App Router metadata API (без `next/head` для app directory).
- OG поля корректно следуют page intent и primary CTA (без двусмысленности).

## References
- [`02-information-architecture-and-content-spec.md`](02-information-architecture-and-content-spec.md) — sections: Page brief (SEO fields)
- [`04-nextjs-implementation-spec.md`](04-nextjs-implementation-spec.md) — sections: App Router conventions, metadata and OG data

### Task 04.6 — Implement cache strategy & tag invalidation plan
**AI Agent Prompt**
## Goal
Описать, какие data dependencies статические/динамические/TTL и как именно применять `fetch` cache options в Server Components.

## Inputs
- Контур data dependencies из page brief (`02-*`)
- Требования к кэшу из `04-nextjs-implementation-spec.md`

## Steps
1. Для каждого data source выбрать `force-cache`, `no-store` или `next: { revalidate: N }`.
2. Если есть управляемая инвалидация — сформировать план тегов (`tags` + `revalidateTag/updateTag`).
3. Указать where это должно жить (server actions, server components).

## AcceptanceCriteria
- Каждая зависимость данных имеет отмеченную cache policy.
- План tag-based invalidation описан при необходимости.

## References
- [`04-nextjs-implementation-spec.md`](04-nextjs-implementation-spec.md) — sections: Data fetching and cache strategy
- [`09-code-implementation-phases.md`](09-code-implementation-phases.md) — Phase 4 definition of done/gates about cache strategy

### Task 04.7 — Add streaming/Suspense boundaries for async regions
**AI Agent Prompt**
## Goal
Определить асинхронные регионы страницы и спроектировать streaming/Suspense fallback так, чтобы не ухудшать INP/CLS.

## Inputs
- Knowledge of async zones from page brief / mapping
- Требования Next.js streaming guidance (через `04-*` + `05-*`/`08-*`)

## Steps
1. Идентифицировать async регионы (where data fetch is awaited).
2. Определить fallback UI (loading skeletons) и что должно не сдвигаться (CLS guard).
3. Описать, какие части остаются server-rendered, а какие могут быть “async-delayed”.
4. Указать как это увязано с production states (`03-*`).

## AcceptanceCriteria
- Для каждого async региона есть fallback.
- Fallback не ломает layout stability (CLS).

## References
- [`04-nextjs-implementation-spec.md`](04-nextjs-implementation-spec.md) — sections: data fetching/streaming policy
- [`03-pen-design-system-and-page-spec.md`](03-pen-design-system-and-page-spec.md) — sections: production states (loading/skeleton expectations)
- [`08-pagespeed-green-zone-playbook.md`](08-pagespeed-green-zone-playbook.md) — sections: CLS/LCP/INP optimization and streaming/Suspense requirements

### Task 04.8 — Implement motion intent scaffold + reduced-motion handling
**AI Agent Prompt**
## Goal
Реализовать motion как UX intent согласно motion policy, с учетом reduced-motion поведения.

## Inputs
- Motion intents из `.pen`/page spec
- `07-motion-and-microinteractions-guidelines.md`
- motion policy expectations из `04-*` и performance constraints из `05-*`/`08-*`

## Steps
1. Для каждого анимируемого региона описать UX-цель (feedback/continuity/emphasis/guidance).
2. Проверить приоритеты: использовать `opacity/transform`.
3. Добавить reduced-motion fallback scaffold.
4. Описать performance guardrails: как избегаем long tasks/layout shifts.

## AcceptanceCriteria
- Motion соответствует требованиям `07-*` (токены + допустимые свойства).
- Reduced motion не ухудшает UX.
- Нет layout-trigger тяжелых анимаций в критичных сценариях.

## References
- [`07-motion-and-microinteractions-guidelines.md`](07-motion-and-microinteractions-guidelines.md) — sections: principles, allowed animation types, reduced motion behavior
- [`04-nextjs-implementation-spec.md`](04-nextjs-implementation-spec.md) — sections: Motion implementation policy
- [`08-pagespeed-green-zone-playbook.md`](08-pagespeed-green-zone-playbook.md) — sections: motion/performance guardrails

### Task 04.9 — Implement production states for page + controls
**AI Agent Prompt**
## Goal
Обеспечить покрытие production states на уровне страницы и ключевых control-patterns: navigation/menu/modal/forms/notifications.

## Inputs
- Required states from `03-*` and page-level states from `.pen`
- Premium quality bar requirements from `06-*`

## Steps
1. Перечислить page-level states: `empty/loading/error/forbidden` (+ success where applicable).
2. Перечислить control states: input/button/link/nav/modal/notification states.
3. Описать компонентные реализации так, чтобы состояния не были “половинчатыми”.
4. Указать, как эти состояния визуально и семантически отражаются (a11y considerations).

## AcceptanceCriteria
- Покрыты все обязательные page-level состояния.
- Для input/button/link + menu/modals/toasts заданы состояния по матрице из `03-*`.

## References
- [`03-pen-design-system-and-page-spec.md`](03-pen-design-system-and-page-spec.md) — sections: system states, control states matrix
- [`06-premium-pen-and-faang-ux-ui-standards.md`](06-premium-pen-and-faang-ux-ui-standards.md) — sections: production states and premium quality bar

### Task 04.10 — Produce Phase 04 checklist & handoff package
**AI Agent Prompt**
## Goal
Подготовить handoff package для следующей итерации Phase 5: итоговый checklist по `nextjs-page-implementation-checklist.md` + summary mapping и список открытых вопросов.

## Inputs
- Implementation plan + mapping table
- `templates/nextjs-page-implementation-checklist.md`

## Steps
1. Заполнить чеклист из шаблона: Atomic Design, App Router conventions, cache strategy, tokens, performance baseline, motion reduced motion.
2. Отдельно: сформировать список “если Phase 5 покажет P0 — это может быть связано с …”.
3. Подготовить краткий handoff section: что агенту QA/AI проверять первым.

## AcceptanceCriteria
- Checklist полностью заполнен.
- Handoff содержит список open questions и expected risk areas.

## References
- [`templates/nextjs-page-implementation-checklist.md`](templates/nextjs-page-implementation-checklist.md) — sections: architecture/Next.js standards/performance/a11y/motion/QA gates
- [`05-ai-design-match-performance-and-qa.md`](05-ai-design-match-performance-and-qa.md) — sections: fix-loop and quality gates overview

