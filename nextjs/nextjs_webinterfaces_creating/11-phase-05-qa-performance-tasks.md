---
title: "Phase 05: AI Design Match + QA + performance gates (AI-agent prompt pack)"
stage: "Code QA"
audience: ["AI Agents", "QA", "Frontend", "Tech Writers"]
---

## Goal of Phase 05
После каждой итерации реализации обеспечить прохождение quality gates: structure/tokens/a11y/motion/visual + performance (PageSpeed green zone и Core Web Vitals thresholds) через единый AI Design Match + QA fix-loop.

## Task Pack (7 tasks)

### Task 05.1 — Run AI Design Match report (structure/tokens/a11y/perf/visual diff)
**AI Agent Prompt**
## Role
QA/AI verification agent with deep understanding of `.pen` DesignModel and implementation mapping.

## Goal
Собрать AI Design Match report для конкретной страницы на основе:
- DesignModel из `.pen`
- WireframeModel из wireframe md
- ImplModel из DOM/CSSOM и компонентной структуры.

## Inputs
- `.pen` snapshot/DesignModel
- wireframe md regions + expected state expectations
- implementation structure info (component tree, selectors, or DOM snapshots)

## Steps
1. Свести diff-categories: structure, tokens, spacing/typography, interactions/states, motion, accessibility, visual.
2. Заполнить таблицы quality gates факт/порог/статус.
3. Для каждого расхождения указать:
   - ID
   - приоритет (P0/P1/P2)
   - селектор/узел (где искать в реализации)
   - ожидаемое vs фактическое
   - статус (open/fixed)
4. Зафиксировать итог: `pass` или `requires-fix`.

## Constraints / Guardrails
- P0/P1/P2 обязаны отражать влияние на UX, conversion и критичность a11y.
- Итерация не должна “маскировать” структурные отклонения.

## Expected Output
Заполненный отчет по шаблону `templates/ai-design-match-report-template.md`.

## AcceptanceCriteria
- Отчет содержит заполненные metrics (structure/tokens/a11y/contrast/visual diff/PageSpeed/CWV) с явным статусом.
- Есть минимум 1 entry для каждого выявленного расхождения, включая приоритет.
- Итоговый статус корректно определяется правилами `05-*` (pass/requires-fix).

## References
- [`05-ai-design-match-performance-and-qa.md`](05-ai-design-match-performance-and-qa.md) — sections: контур проверки, quality gates, fix-loop
- [`templates/ai-design-match-report-template.md`](templates/ai-design-match-report-template.md) — sections: quality gates table, diff list, a11y section, fix-loop section
- [`08-pagespeed-green-zone-playbook.md`](08-pagespeed-green-zone-playbook.md) — sections: release gate, LCP/INP/CLS thresholds, diagnose->fix->verify

### Task 05.2 — Defect triage: classify P0/P1/P2 and produce fix loop plan
**AI Agent Prompt**
## Goal
Сформировать triage план исправлений по report:
- какие дефекты чинить первыми (P0 -> P1 -> P2)
- какой порядок итераций
- что проверяем после каждого цикла.

## Inputs
- AI Design Match report from Task 05.1

## Steps
1. Для каждого diff entry определить приоритет P0/P1/P2 по правилам:
   - P0: блокеры UX/a11y/структуры; может помешать “выполнению conversion-microstep”
   - P1: заметные расхождения, которые ухудшают perception quality
   - P2: незначительные несоответствия/окружные расхождения
2. Сформировать план итераций исправлений:
   - cycle 1 закрывает все P0
   - cycle 2 закрывает все P1
   - cycle 3 закрывает все P2
3. Для каждого cycle описать “verification checklist” (что должно измениться по diff-категориям).

## AcceptanceCriteria
- Есть полностью определенный порядок fix-loop без перекрывающих итераций.
- Каждый defect ссылается на конкретный report entry/ID.

## References
- [`05-ai-design-match-performance-and-qa.md`](05-ai-design-match-performance-and-qa.md) — sections: Fix-loop process, классификация дефектов P0/P1/P2

### Task 05.3 — Produce accessibility validation plan (axe-core + Playwright)
**AI Agent Prompt**
## Goal
Сформировать план проверки доступности через axe-core в Playwright и описать, как интерпретировать результаты для страницы.

## Inputs
- Страница и ее interactive регионы (nav/menu/modal/forms/toasts)
- Список expected production states и control states из `03-*`

## Steps
1. Указать подход “full page scan” и “targeted scans” по регионам (interactive зоны сначала в нужном состоянии).
2. Предложить, какие селекторы/узлы включить в include-list сканов (на основе mapping и region IDs).
3. Описать критерии приемки:
   - Critical a11y violations = 0
   - Contrast AA pass (где применимо автоматикой)
4. Дать структуру ожидаемого output, который нужно перенести в секции `axe-core` и `diff` отчета.

## Constraints / Guardrails
- Не заменять ручные проверки полностью автоматикой (но в doc достаточно описать ожидаемые автоматические проверки).

## AcceptanceCriteria
- План содержит список scan scopes (минимум: меню/модалки/формы/уведомления).
- Определены правила занесения найденных нарушений в report template.

## References
- [`05-ai-design-match-performance-and-qa.md`](05-ai-design-match-performance-and-qa.md) — sections: инструменты (Playwright, axe-core), quality gates по a11y
- [`templates/ai-design-match-report-template.md`](templates/ai-design-match-report-template.md) — sections: A11y (axe-core), Найденные расхождения
- [`03-pen-design-system-and-page-spec.md`](03-pen-design-system-and-page-spec.md) — sections: production states + control states (для выбора targeted scans)

### Task 05.4 — Validate performance with PageSpeed/Lighthouse against release gate
**AI Agent Prompt**
## Goal
Проверить performance на representative URL (mobile/desktop) и подтвердить соответствие release gate и CWV thresholds.

## Inputs
- URL/route of page
- Implementation build/deploy context
- AI Design Match report (для приоритизации проблем)

## Steps
1. Снять baseline (lab): Lighthouse/PageSpeed.
2. Сопоставить измеренные значения с порогами:
   - PageSpeed mobile >= 90
   - PageSpeed desktop >= 90
   - LCP <= 2.5s (p75)
   - INP <= 200ms (p75)
   - CLS <= 0.1 (p75)
3. Выявить причины регрессий из report: много client JS/long tasks, layout shifts, тяжелые above-the-fold блоки.
4. Сформировать “fix hypotheses” для Phase 8:
   - что оптимизировать
   - какой компонент/регион вероятно виноват
   - какие проверки после фикса.

## AcceptanceCriteria
- Есть таблица фактических значений vs пороги.
- Если есть падение ниже порогов — сформирован список гипотез исправлений с приоритетом.

## References
- [`05-ai-design-match-performance-and-qa.md`](05-ai-design-match-performance-and-qa.md) — sections: PageSpeed/CWV quality gates
- [`08-pagespeed-green-zone-playbook.md`](08-pagespeed-green-zone-playbook.md) — sections: workflow diagnose->fix->verify, LCP/INP/CLS optimization, release gate

### Task 05.5 — Ensure motion + reduced-motion behavior passes QA (no UX regressions)
**AI Agent Prompt**
## Goal
Проверить motion на соответствие motion policy и reduced-motion поведению, и убедиться, что motion не ухудшает INP/CLS.

## Inputs
- Motion spec/intent from `.pen` (region list + expected behavior)
- Implementation motion logic/handlers (or description)

## Steps
1. Для каждого анимируемого региона проверить цель motion (feedback/continuity/emphasis/guidance).
2. Убедиться, что используются допустимые свойства (opacity/transform) и отсутствуют запрещенные тяжелые эффекты в критичных сценариях.
3. Проверить `prefers-reduced-motion` fallback (упростить/отключить существенную анимацию).
4. Сформировать вывод: pass/needs fix и почему.

## AcceptanceCriteria
- Reduced-motion scaffold соответствует motion guidelines.
- Нет признаков ухудшения CLS/INP, связанных с анимациями.

## References
- [`07-motion-and-microinteractions-guidelines.md`](07-motion-and-microinteractions-guidelines.md) — sections: allowed animation types, reduced motion behavior, performance guardrails
- [`05-ai-design-match-performance-and-qa.md`](05-ai-design-match-performance-and-qa.md) — sections: Motion QA checks, quality gates
- [`08-pagespeed-green-zone-playbook.md`](08-pagespeed-green-zone-playbook.md) — sections: motion/performance guardrails

### Task 05.6 — Prepare “requires-fix” iteration report artifacts (what to fix first)
**AI Agent Prompt**
## Goal
Если report показывает `requires-fix`, сформировать конкретные задачи на исправление:
- по категориям
- с привязкой к region/node/selector
- с предположением root cause.

## Inputs
- AI Design Match report + triage plan (Task 05.2)

## Steps
1. Для всех P0 defects описать:
   - likely root cause
   - minimal change strategy
   - verification step (как понять, что P0 закрыты)
2. Для P1/P2 — аналогично, но кратко (без детализации root cause до цикла).

## AcceptanceCriteria
- P0 фикс-список детализирован так, чтобы инженер мог приступить без дополнительных уточнений.
- Для каждой правки есть критерий верификации.

## References
- [`05-ai-design-match-performance-and-qa.md`](05-ai-design-match-performance-and-qa.md) — sections: Fix-loop process, дефекты P0/P1/P2
- [`templates/ai-design-match-report-template.md`](templates/ai-design-match-report-template.md) — sections: Найденные расхождения, Fix-loop

### Task 05.7 — Finalize Phase 05 status and ensure gate-ready package
**AI Agent Prompt**
## Goal
Свести результаты Phase 05 в “gate-ready package”:
- итоговый report
- статус: `pass` или `requires-fix`
- список артефактов, которые нужно передать следующей фазе (Phase 6/7/8).

## Inputs
- AI Design Match report + performance validation results

## Steps
1. Проверить, что выполнены обязательные quality gates.
2. Упаковать deliverables по checklist:
   - report saved
   - fix-loop closed as per status
   - notes for Phase 6/7/8
3. Если требуется fix — указать, что именно приоритетно.

## AcceptanceCriteria
- Статус соответствует фактам (не “optimistic pass”).
- Gate-ready package имеет однозначный состав артефактов.

## References
- [`05-ai-design-match-performance-and-qa.md`](05-ai-design-match-performance-and-qa.md) — sections: Definition of Done
- [`08-pagespeed-green-zone-playbook.md`](08-pagespeed-green-zone-playbook.md) — sections: release gate logic

