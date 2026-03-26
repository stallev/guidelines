---
title: "Code implementation phases (4-8): inputs, outputs, gates"
stage: "Code/Design pipeline"
audience: ["Engineering", "QA/AI", "Design", "Tech Writers"]
---

## Scope
Документ фиксирует **только code-имплементационные фазы** pipeline (начиная примерно с этапа 4), то есть: перенос требований из `IA + .pen` в Next.js реализацию и прохождение code-quality gates.

Фазы 1-3 (research, IA, wireframes, `.pen`) считаются входными данными.

## Invariants (в течение фаз 4-8)
- Структура страницы в коде соответствует wireframe region структуре, которая замаплена в `.pen` и в expected Atomic Design уровни (`atoms -> molecules -> organisms -> templates -> pages`).
- По умолчанию используется Server-first архитектура (Server Components), а `use client` применяется только для интерактивных островов.
- Покрытие production states не опускается: `empty/loading/error/forbidden` и состояния интерактивных controls.
- После завершения критичных отрезков проводится AI Design Match / quality checks согласно `05-*`.

## Phase 4: Next.js implementation (Atomic Design + App Router)
### Goal
Реализовать страницу в `Next.js 16+` с 1:1 структурным соответствием `.pen` и с соблюдением Next.js best practices (boundaries, cache, metadata API, motion policy).

### Inputs (обязательные)
- IA + page brief: `02-information-architecture-and-content-spec.md`
- Wireframes (mobile/tablet/desktop) + mapping: `templates/wireframes-mobile-tablet-desktop-template.md` (как артефакт)
- `.pen` design system + page spec: `03-pen-design-system-and-page-spec.md`

### Outputs
- Композиция компонентов в структуре Atomic Design:
  - `src/components/atoms/*`
  - `src/components/molecules/*`
  - `src/components/organisms/*`
  - `src/components/templates/*`
  - `src/app/**/page.tsx` (страница)
- Реализованные UI states (empty/loading/error/forbidden/success при применимости)
- Metadata/OG через Metadata API App Router
- Cache strategy для `fetch` (force-cache/no-store/revalidate) и при необходимости тегированная инвалидация (`revalidateTag/updateTag`)
- Motion implementation scaffold (с reduced-motion fallback)

### Definition of Done (гейт)
- Базовый implementation checklist прошел, и структурные отклонения от wireframe regions не являются “скрытыми” (фиксируются и согласуются).
- Запланирован запуск AI Design Match + QA контур (`05-*`) до утверждения “pass” по странице.

## Phase 5: AI Design Match + QA + performance gates
### Goal
Автоматически проверить соответствие реализации `.pen` (structure/tokens/layout/states/interactions/motion/a11y/visual) и добиться прохождения quality gates.

### Inputs
- Реализация в коде (DOM/CSSOM + компонентная структура)
- `.pen` DesignModel: `05-ai-design-match-performance-and-qa.md` (как правило/контур)
- WireframeModel: структура и ожидания регионов (из `02-*`)

### Outputs
- AI Design Match report по шаблону: `templates/ai-design-match-report-template.md`
- Классифицированные дефекты: `P0`, `P1`, `P2`
- Заполненный fix-loop до состояния `pass` или `requires-fix`

### Definition of Done (гейт)
Минимальные пороги:
- Structure match `>= 0.90`
- Token match `>= 0.95`
- Critical a11y violations `= 0`
- Contrast AA = pass
- PageSpeed mobile/desktop `>= 90` и CWV пороги (p75):
  - `LCP <= 2.5s`
  - `INP <= 200ms`
  - `CLS <= 0.1`
- Reduced-motion behavior подтвержден и не ломает UX (`05-*` + `07-*` + `08-*`)

## Phase 6: Premium UX/UI compliance
### Goal
Добиться соответствия FAANG/premium UX/UI quality bar: scanability, hierarchy, progressive disclosure, trust/privacy placement и терминология/CTA-иерархия.

### Inputs
- Требования premium-quality: `06-premium-pen-and-faang-ux-ui-standards.md`
- Motion + microinteraction policy: `07-motion-and-microinteractions-guidelines.md`
- Implementation artifacts (код страницы после Phase 4/5)

### Outputs
- Контрольный чеклист premium UX/UI (соответствие принятому UI bar)
- Зафиксированные исправления для контентной/UX-логики (например: Primary CTA placement, trust signals, production states)

### Definition of Done (гейт)
- В интерфейсе отсутствуют “необъяснимые” расхождения по premium quality bar.
- Нет неоднозначных/неполных production states.
- Терминология и Primary CTA согласованы с wireframe metadata.

## Phase 7: Motion + microinteractions
### Goal
Реализовать motion как UX-инструмент (feedback/continuity/emphasis/guidance) с безопасными performance guardrails и поддержкой `prefers-reduced-motion`.

### Inputs
- Motion system tokens и policy: `07-motion-and-microinteractions-guidelines.md`
- Motion/UX constraints из `04-*` и performance gates из `05-*`, `08-*`

### Outputs
- Реализованные motion patterns на соответствующих регионах
- Reduced-motion fallback scaffold
- Документированные motion decisions (для quality reporting)

### Definition of Done (гейт)
- Motion не ухудшает INP/CLS и не создает layout shifts.
- Для `prefers-reduced-motion: reduce` — безопасный fallback (как минимум: упрощение/отключение существенной анимации).

## Phase 8: PageSpeed green zone (diagnose -> fix -> verify)
### Goal
Выйти в PageSpeed green zone как обязательный результат pipeline для целевых страниц и подтвердить стабильность при повторной валидации.

### Inputs
- PageSpeed/CWV baseline: измерения (lab + field при наличии)
- Технические требования по performance: `08-pagespeed-green-zone-playbook.md`
- Implementation + known issue list из AI Design Match report (`05-*`)

### Outputs
- Отчет по workflow diagnose -> fix -> verify
- Итоговый статус release gate pass

### Definition of Done (гейт)
Одновременное выполнение:
- PageSpeed `>= 90` (mobile/desktop)
- Core Web Vitals пороги соблюдены
- Нет блокирующих regressions по a11y/UX production states

## Suggested document cross-reference (как использовать)
- При подготовке Phase 4 используйте checklist: `templates/nextjs-page-implementation-checklist.md`.
- При Phase 5 используйте report template: `templates/ai-design-match-report-template.md`.
- Для motion и reduced-motion сверяйте “motion sections” с `07-*`.
- Для PageSpeed используйте `08-*` workflow и release gate.

