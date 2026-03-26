---
title: "Phase 08: PageSpeed green zone (AI-agent prompt pack)"
stage: "Performance release gates"
audience: ["AI Agents", "Frontend", "QA"]
---

## Goal of Phase 08
Провести diagnose -> fix -> verify и подтвердить, что целевая страница проходит PageSpeed green zone и Core Web Vitals пороги без блокирующих UX/a11y regressions.

## Task Pack (5 tasks)

### Task 08.1 — Measure baseline (mobile/desktop) + record audit evidence
**AI Agent Prompt**
## Role
Performance engineer agent.

## Goal
Снять baseline метрики для representative URL (mobile + desktop) и сохранить доказательства аудита.

## Inputs
- route/URL страницы
- target devices/conditions (если есть)
- current build/deploy reference

## Steps
1. Запустить lab audit: Lighthouse / PageSpeed на mobile и desktop.
2. Записать значения:
   - PageSpeed (mobile/desktop)
   - LCP, INP, CLS (p75 если доступно)
   - дополнительные диагностические показатели: TTFB, JS size (если доступны в отчете)
3. Опционально (если есть RUM/field): зафиксировать CrUX/web-vitals сигналы для контекста.
4. Подготовить краткое резюме: какие именно метрики ниже порогов и на какие факторы указывает отчет.

## AcceptanceCriteria
- Есть таблица “Факт vs Порог” со всеми обязательными метриками Phase 08.
- Есть ссылка/упоминание evidence: Lighthouse/PageSpeed output (как минимум в виде “audit summary + key findings”).

## References
- [`08-pagespeed-green-zone-playbook.md`](08-pagespeed-green-zone-playbook.md) — sections: KPI/thresholds, framework of measurement

### Task 08.2 — Diagnose root causes mapped to known offenders
**AI Agent Prompt**
## Role
Performance triage agent.

## Goal
Определить likely root causes по каждой метрике, связывая их с архитектурными/UX особенностями pipeline (server/client boundaries, caching, streaming, images/fonts, motion).

## Inputs
- baseline results from Task 08.1
- implementation characteristics (описание/факты):
  - server/client boundaries
  - data cache policies
  - streaming/Suspense usage
  - image/font usage
  - motion behavior (если влияет на CLS/INP)

## Steps
1. Для каждой проблемной метрики выбрать 1-3 гипотезы:
   - LCP: тяжелый above-the-fold, медленная загрузка hero media, шрифты, блокирующий JS
   - INP: long tasks, слишком тяжелые event handlers, избыточный client JS
   - CLS: отсутствие резервирования места, skeleton/layout jumps, motion-induced shifts
2. Указать “что проверить” в реализации (component/region hints).
3. Привязать гипотезы к guidance:
   - Next.js: `next/image`, `next/font`, cache strategy, streaming
   - Motion: avoid layout-trigger heavy animations
   - General: break long tasks, avoid long client islands

## AcceptanceCriteria
- Для каждой метрики с падением есть как минимум 1 гипотеза с actionable проверкой.
- Гипотезы связаны с конкретными областями рекомендаций из `04-*`/`07-*`/`08-*`.

## References
- [`08-pagespeed-green-zone-playbook.md`](08-pagespeed-green-zone-playbook.md) — sections: LCP/INP/CLS optimization, Next.js-specific requirements, anti-patterns
- [`04-nextjs-implementation-spec.md`](04-nextjs-implementation-spec.md) — sections: performance/accessibility defaults, data fetching/cache strategy, motion policy
- [`07-motion-and-microinteractions-guidelines.md`](07-motion-and-microinteractions-guidelines.md) — sections: performance guardrails, allowed animations

### Task 08.3 — Fix plan (small iterations) aligned with diagnose->fix->verify workflow
**AI Agent Prompt**
## Role
Senior Web Performance Planner.

## Goal
Сформировать план фиксов малыми итерациями, чтобы быстро приблизиться к порогам и избежать долгих изменений без проверки.

## Inputs
- root causes from Task 08.2
- implementation constraints (что можно менять в рамках текущего итерационного цикла)

## Steps
1. Разбить fixes на итерации (например: 1-2 главные причины за раз).
2. Для каждой итерации указать:
   - что меняем (в терминах guidance, без привязки к конкретному PR)
   - какую метрику(ы) хотим улучшить
   - что не должны ухудшить (a11y states, UX hierarchy, reduced motion)
3. Подготовить “verification steps” после каждой итерации: какие измерения повторять и где сравнивать.

## AcceptanceCriteria
- План состоит из конкретных итераций (минимум 2).
- Для каждой итерации есть ожидаемое улучшение и список guardrails.

## References
- [`08-pagespeed-green-zone-playbook.md`](08-pagespeed-green-zone-playbook.md) — sections: workflow diagnose -> fix -> verify, workflow steps
- [`05-ai-design-match-performance-and-qa.md`](05-ai-design-match-performance-and-qa.md) — sections: Fix-loop process (идея последовательности P0/P1/P2), reduced-motion checks

### Task 08.4 — Re-measure and verify against thresholds (mobile/desktop + CWV)
**AI Agent Prompt**
## Role
Performance verification agent.

## Goal
Повторно измерить страницу и подтвердить соответствие порогам.

## Inputs
- evidence from post-fix run (Lighthouse/PageSpeed)
- baseline evidence from Task 08.1

## Steps
1. Снять измерения тем же профилем (lab): mobile + desktop.
2. Сравнить:
   - PageSpeed mobile/desktop (>= 90)
   - LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 (p75)
3. Если пороги не достигнуты — обновить “remaining issues” и привязать их к гипотезам из Task 08.2.

## AcceptanceCriteria
- Есть таблица “baseline vs after” по всем обязательным метрикам.
- Статус итоговый: `pass` или `requires-fix` и объяснение причины.

## References
- [`08-pagespeed-green-zone-playbook.md`](08-pagespeed-green-zone-playbook.md) — sections: KPI/thresholds, Release gate, workflow verify

### Task 08.5 — Final release gate package for Phase 08
**AI Agent Prompt**
## Role
Release gate packager.

## Goal
Собрать финальный отчет, который можно использовать как документационное “условие релиза” для страницы.

## Inputs
- Final verification results from Task 08.4
- AI Design Match / QA status from Phase 05 (pass/requires-fix)
- Motion/reduced-motion status from Phase 07 (if applicable)

## Steps
1. Свести все обязательные gate conditions:
   - PageSpeed mobile >= 90
   - PageSpeed desktop >= 90
   - CWV p75: LCP/INP/CLS
   - Нет блокирующих a11y/UX regressions по production states
2. Опционально: собрать “impact map” — какие изменения повлияли на какие метрики (кратко).
3. Сформировать final decision: “release-ready” или “requires-fix” с приоритетами.

## AcceptanceCriteria
- Итоговая упаковка содержит:
  - итоговые метрики и подтверждение порогов
  - связь с QA/quality gates status
  - список остаточных рисков (если requires-fix)

## References
- [`08-pagespeed-green-zone-playbook.md`](08-pagespeed-green-zone-playbook.md) — sections: Release gate, KPI and thresholds
- [`05-ai-design-match-performance-and-qa.md`](05-ai-design-match-performance-and-qa.md) — sections: Definition of Done, quality gates
- [`07-motion-and-microinteractions-guidelines.md`](07-motion-and-microinteractions-guidelines.md) — sections: reduced motion & performance guardrails

