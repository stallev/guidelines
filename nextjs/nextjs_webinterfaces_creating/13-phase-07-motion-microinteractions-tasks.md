---
title: "Phase 07: Motion + microinteractions (AI-agent prompt pack)"
stage: "Code UX motion"
audience: ["AI Agents", "Frontend", "Design", "QA"]
---

## Goal of Phase 07
Реализовать motion как часть UX: feedback/continuity/emphasis/guidance, с соблюдением motion-system токенов, performance guardrails и обязательной поддержкой `prefers-reduced-motion`.

## Task Pack (4 tasks)

### Task 07.1 — Implement approved motion patterns per region + token usage
**AI Agent Prompt**
## Role
Senior Frontend Engineer focused on UX motion + performance.

## Goal
Сопоставить анимируемые регионы страницы с motion intent и реализовать motion через approved properties и motion tokens.

## Inputs
- `.pen` motion intent per region (или соответствующие секции page spec)
- `07-motion-and-microinteractions-guidelines.md` (tokens + allowed types + hierarchy)
- current implementation motion handlers/animations info (или описания)

## Steps
1. Составить список анимируемых регионов (navigation, overlays, controls, async zones).
2. Для каждого региона:
   - определить UX-цель motion (feedback/continuity/emphasis/guidance)
   - выбрать допустимые свойства (приоритет: `opacity`, `transform`)
   - выбрать durations/easing по motion token policy
3. Проверить choreography:
   - один главный фокус движения в момент времени
   - entry/exit синхронизированы
4. Сформировать список “что нельзя”: избегать width/height/top/left анимаций, тяжелых blur/filter на больших областях и декоративных циклов без UX функции.

## AcceptanceCriteria
- Для каждого анимируемого региона есть motion intent и соответствует соответствующим правилам `07-*`.
- Используются разрешенные свойства и токены длительности/тайминга.
- Choreography не конфликтует и не перегружает восприятие.

## References
- [`07-motion-and-microinteractions-guidelines.md`](07-motion-and-microinteractions-guidelines.md) — sections: principles, motion tokens system, allowed animation types, choreography & hierarchy
- [`04-nextjs-implementation-spec.md`](04-nextjs-implementation-spec.md) — sections: Motion implementation policy (привязка к performance + reduced-motion)

### Task 07.2 — Add reduced-motion fallback scaffold (`prefers-reduced-motion`)
**AI Agent Prompt**
## Role
Accessibility-minded Frontend Engineer.

## Goal
Обеспечить безопасный fallback для пользователей с `prefers-reduced-motion: reduce`.

## Inputs
- motion list + required animations
- reduced-motion policy from `07-*`

## Steps
1. Определить “существенные” анимации и “несущественные” в контексте страницы (reduce должен минимизировать влияние).
2. Применить reduced-motion стратегию:
   - отключение/упрощение анимаций
   - замена сложных перемещений на opacity transitions или 1ms-скейл/длительность (как описано в guidelines)
3. Проверить, что fallback:
   - не ломает semantics интерактивных элементов
   - не ухудшает доступность focus path/keyboard interactions.

## AcceptanceCriteria
- Reduced-motion fallback описан и соответствует policy.
- При reduce режимах отсутствуют тяжелые/дезориентирующие анимации.

## References
- [`07-motion-and-microinteractions-guidelines.md`](07-motion-and-microinteractions-guidelines.md) — sections: Accessibility и reduced motion, базовый CSS-паттерн
- [`04-nextjs-implementation-spec.md`](04-nextjs-implementation-spec.md) — sections: Motion implementation policy

### Task 07.3 — Motion QA: avoid INP/CLS regressions + verify layout stability
**AI Agent Prompt**
## Role
QA/AI performance auditor.

## Goal
Подтвердить, что motion не ухудшает Core Web Vitals (INP/CLS) и не создает layout shifts.

## Inputs
- motion implementation details
- performance thresholds from `05-*` and `08-*`

## Steps
1. Идентифицировать точки, где motion может вызвать layout shift:
   - анимации transform/opacity vs layout-trigger properties
   - async state transitions, skeleton->loaded transitions
2. Проверить принципы performance guardrails:
   - motion не мешает LCP
   - интерактивные анимации не деградируют INP
   - layout stability обязательна: CLS не увеличивается из-за motion
3. Сформировать “QA expected outcomes”:
   - если при проверке CLS растет — указать, какие регионы проверить в первую очередь

## AcceptanceCriteria
- Motion не провоцирует regression INP/CLS согласно указанным порогам Phase 05/08.
- Есть конкретный список потенциальных проблемных регионов (если проваливается).

## References
- [`07-motion-and-microinteractions-guidelines.md`](07-motion-and-microinteractions-guidelines.md) — sections: Performance guardrails, validation quality
- [`05-ai-design-match-performance-and-qa.md`](05-ai-design-match-performance-and-qa.md) — sections: Motion QA checks, quality gates
- [`08-pagespeed-green-zone-playbook.md`](08-pagespeed-green-zone-playbook.md) — sections: Связка motion и performance, workflow diagnose->fix->verify

### Task 07.4 — Prepare Phase 07 handoff (motion decisions + reduced-motion mapping)
**AI Agent Prompt**
## Role
Technical Writer + UX compliance reporter.

## Goal
Свести motion решения, reduced-motion strategy и QA ожидаемые проверки в handoff package для следующей фазы.

## Inputs
- результатов Task 07.1..07.3

## Steps
1. Сформировать таблицу:
   - Region id
   - Motion intent
   - Allowed properties/tokens
   - Reduced-motion behavior
   - QA checks to run
2. Сформировать список “risk areas” — где чаще всего происходят CLS/INP проблемы.

## AcceptanceCriteria
- Handoff содержит перечисление регионов и reduced-motion mapping.
- QA checks и risk areas описаны достаточно конкретно, чтобы инженер мог выполнить без уточнений.

## References
- [`13-phase-07-motion-microinteractions-tasks.md`](13-phase-07-motion-microinteractions-tasks.md) — структура таблицы (как deliverable)
- [`07-motion-and-microinteractions-guidelines.md`](07-motion-and-microinteractions-guidelines.md) — sections: validation качество, reduced motion
- [`05-ai-design-match-performance-and-qa.md`](05-ai-design-match-performance-and-qa.md) — sections: Definition of Done по motion/quality gates

*** End Patch
