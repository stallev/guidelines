---
title: "Phase 06: Premium UX/UI compliance (AI-agent prompt pack)"
stage: "Code UX compliance"
audience: ["AI Agents", "Design", "Frontend", "QA"]
---

## Goal of Phase 06
Привести реализацию к FAANG-level UX/UI quality bar: обеспечить консистентность терминов и паттернов, scanability/иерархию, progressive disclosure для сложных сценариев, корректное размещение trust/privacy сигналов и полноту production states.

## Task Pack (5 tasks)

### Task 06.1 — Premium quality bar audit (hierarchy, scanability, predictability)
**AI Agent Prompt**
## Role
Senior UX/UI Designer + IA Lead.

## Goal
Сделать аудит реализации против premium quality bar и зафиксировать расхождения в “requires-fix” терминах.

## Inputs
- Реализация в коде (рендер страницы)
- `.pen` design spec (page blueprint + component inventory)
- Wireframe md expectations (особенно Primary CTA region и ключевые регионы)

## Steps
1. Проверить предсказуемость и консистентность: терминология, location of primary actions, повторяемые паттерны в соседних регионах.
2. Проверить иерархию и scanability: один главный фокус, заголовки/подзаголовки/supporting text соответствуют типографической иерархии из token pack.
3. Проверить progressive disclosure: MVP не перегружается второстепенными элементами; дополнительные сценарные элементы раскрываются по намерению пользователя.
4. Сравнить список “принятых/отклоненных UX-паттернов” (из `.pen` spec — если он предусмотрен) с тем, что реализовано.

## Constraints / Guardrails
- Если есть конфликт с product/IA — приоритеты такие же, как в `06-*`: PRD > утвержденные user flows > safety/privacy > guideline.

## Expected Output
- Checklist результат:
  - pass / requires-fix
  - список несоответствий с указанием region id / UI element

## AcceptanceCriteria
- Есть утвержденное решение pass/requires-fix.
- Каждый “requires-fix” пункт связан с конкретным премиум-правилом и конкретным UI регионом/элементом.

## References
- [`06-premium-pen-and-faang-ux-ui-standards.md`](06-premium-pen-and-faang-ux-ui-standards.md) — sections: FAANG-level UX/UI quality bar, predictability/consistency, hierarchy/scanability, progressive disclosure
- [`03-pen-design-system-and-page-spec.md`](03-pen-design-system-and-page-spec.md) — sections: Premium quality bar, wireframe->.pen mapping rules

### Task 06.2 — Verify production states coverage (page + controls)
**AI Agent Prompt**
## Role
Senior QA/UX compliance reviewer.

## Goal
Проверить, что production states покрыты корректно и согласованы с `.pen` и wireframe expectations.

## Inputs
- `.pen` production states expectations
- Код (UI states & conditional rendering)

## Steps
1. Проверить page-level states: `empty/loading/error/forbidden` (+ `success` если applicable).
2. Проверить control states по матрице:
   - `input`: default/focus/filled/error/disabled
   - `button`: default/hover/focus/active/loading/disabled
   - `link`: default/hover/focus/visited/active
3. Проверить, что состояния не являются “частично включенными” и не оставляют интерактивность в некорректном состоянии (например: loading не позволяет повторный submit).

## Constraints / Guardrails
- Если state отсутствует, это фиксируется как P0 в логике Phase 05.

## Expected Output
- State coverage table + pass/requires-fix.

## AcceptanceCriteria
- Для всех обязательных state categories есть реализованные соответствия.
- Для каждого missing/incorrect state указаны:
  - affected UI element/region
  - expected state vs actual behavior

## References
- [`03-pen-design-system-and-page-spec.md`](03-pen-design-system-and-page-spec.md) — sections: обязательные системные состояния, input/button/link states matrix
- [`06-premium-pen-and-faang-ux-ui-standards.md`](06-premium-pen-and-faang-ux-ui-standards.md) — sections: production states by default
- [`templates/pen-page-checklist-template.md`](templates/pen-page-checklist-template.md) — sections: Системные состояния

### Task 06.3 — Primary CTA consistency + microcopy verification
**AI Agent Prompt**
## Role
Conversion-focused UX writer + Senior frontend reviewer.

## Goal
Убедиться, что `Primary CTA` консистентен с wireframe metadata и корректно ведет к целевому action на всех breakpoints.

## Inputs
- wireframe md: Primary CTA метаданные
- `.pen` page spec: primary action и supporting microcopy
- Код: реализации primary CTA placements and content

## Steps
1. Проверить визуальную и семантическую консистентность: Primary CTA в ожидаемом месте и не “теряется” на mobile/tablet/desktop.
2. Проверить microcopy: подписи, инструкции, ожидания и формулировки ошибок/валидаций.
3. Проверить CTA на high-conversion points в сценарии:
   - соответствие “conversion-microstep”
   - отсутствие friction (например: лишние поля/непонятные ошибки — если есть формы)

## AcceptanceCriteria
- Primary CTA совпадает с wireframe metadata по смыслу и роли.
- Microcopy не противоречит ожиданиям формы/действия и не создает двусмысленность.

## References
- [`06-premium-pen-and-faang-ux-ui-standards.md`](06-premium-pen-and-faang-ux-ui-standards.md) — sections: FAANG-level UX/UI quality bar, Primary CTA policy
- [`02-information-architecture-and-content-spec.md`](02-information-architecture-and-content-spec.md) — sections: user flows, page brief (CTA hierarchy)
- [`05-ai-design-match-performance-and-qa.md`](05-ai-design-match-performance-and-qa.md) — sections: high-conversion checks

### Task 06.4 — Trust & privacy placement, error messaging clarity
**AI Agent Prompt**
## Role
Safety/privacy-focused UX reviewer.

## Goal
Проверить placement trust/privacy сигналов рядом с действиями высокого риска и корректность формулировок ошибок/разрешений.

## Inputs
- `.pen` trust/privacy sections
- Код: компоненты доверия, формы и сообщения об ошибках/forbidden

## Steps
1. Идентифицировать зоны высокого риска (формы, чувствительные данные, forbidden/error states).
2. Проверить размещение trust-сигналов: рядом с action высокого риска, а не “где-то ниже”.
3. Проверить формулировки ошибок:
   - прозрачность ожиданий
   - отсутствие двусмысленности
   - соответствует production states from `03-*`

## AcceptanceCriteria
- Trust/privacy сигналы присутствуют и находятся рядом с соответствующими действиями.
- Ошибки в `error/forbidden` states сформулированы прозрачно и согласованы с policy.

## References
- [`06-premium-pen-and-faang-ux-ui-standards.md`](06-premium-pen-and-faang-ux-ui-standards.md) — sections: Доверие и приватность
- [`03-pen-design-system-and-page-spec.md`](03-pen-design-system-and-page-spec.md) — sections: page states + ready-for-dev criteria (без неоднозначных состояний)

### Task 06.5 — Produce Phase 06 compliance report for next QA phase
**AI Agent Prompt**
## Role
Technical writer with UX compliance reporting skill.

## Goal
Сформировать артефакты Phase 06 для передачи в команду: summary + список расхождений и ожидаемые фиксы.

## Inputs
- результаты Task 06.1..06.4

## Steps
1. Свести все обнаруженные расхождения в единый список:
   - Category: hierarchy/scanability/progressive-disclosure/cta-states/trust-privacy/microcopy
   - Priority hint: P0/P1/P2 (привязка к логике Phase 05)
   - Region id / component name
2. Сформировать “first things first” список для Phase 05 fix-loop или для Phase 7/8 (если проблема performance/UX).

## AcceptanceCriteria
- Итоговый документ читается как “что исправить и почему”.
- Нет неопределенных формулировок: каждое замечание привязано к конкретному элементу.

## References
- [`05-ai-design-match-performance-and-qa.md`](05-ai-design-match-performance-and-qa.md) — sections: Fix-loop process, P0/P1/P2 triage logic
- [`06-premium-pen-and-faang-ux-ui-standards.md`](06-premium-pen-and-faang-ux-ui-standards.md) — sections: FAANG-level UX/UI quality bar + ready criteria

