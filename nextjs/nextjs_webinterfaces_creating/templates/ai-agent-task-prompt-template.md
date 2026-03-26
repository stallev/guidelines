---
title: "Template: AI agent task prompt (References + acceptance)"
stage: "AI prompting"
---

## Purpose
Шаблон стандартит формат “task as prompt” для AI-агентов в рамках pipeline каталога `nextjs_webinterfaces_creating`.

Требование: каждая задача должна включать конкретные `AcceptanceCriteria` и `References` на релевантные фрагменты PRD/guidelines из этого же каталога.

## How to use
1. Сформулируйте задачу так, чтобы она имела измеримое “готово”.
2. Укажите входы (какие артефакты используются).
3. Опишите пошаговое выполнение (включая проверки/валидации).
4. Добавьте ссылки в `References`: минимум 2-5 файлов из каталога.
5. В `AcceptanceCriteria` пропишите критерии “pass/requires-fix” или чеклист “галочки”.

## Prompt template
```md
You are an expert implementation/documentation agent for `nextjs_webinterfaces_creating`.

## Role
Senior Fullstack Developer + Technical Writer who can translate product/UI specs into Next.js 16+ implementation-ready artifacts.

## Goal
<Опишите цель задачи в 1-2 предложениях так, чтобы было понятно “что в итоге должно появиться/быть исправлено”.>

## Inputs
- Primary input artifacts:
  - <например: IA spec file, wireframes template, .pen spec, implementation spec>
- Current working state (if any):
  - <например: “есть черновая реализация”, “есть AI Design Match report”, “есть P0/P1/P2 список”>

## Steps
1. <Step 1: уточнить контекст/инварианты/структуру>
2. <Step 2: сопоставить wireframe regions и .pen mappings>
3. <Step 3: определить атомарный/композиционный план (Atomic Design)>
4. <Step 4: описать как реализовать server/client boundaries>
5. <Step 5: указать cache/streaming/motion requirements where applicable>
6. <Step 6: run/describe relevant quality gates>

## Constraints / Guardrails
- Follow Next.js best practices: Server Components by default; use `use client` only when needed.
- Preserve wireframe region structure and required production states.
- Avoid performance regressions: do not create long client tasks; keep motion safe (opacity/transform preferred).
- Ensure accessibility: all interactive elements must have keyboard focus, labels, and safe semantics.

## Expected Output
Return ONLY the following sections:
1) Deliverable Summary
2) Checklist of Work Items
3) Implementation Notes (if code-relevant)
4) QA/Validation Plan
5) Risks & Open Questions

## AcceptanceCriteria
- The output must explicitly cover:
  - Required regions / states / tokens from references
  - The correct Next.js patterns (metadata API, cache strategy, streaming/Suspense where applicable)
  - A clear pass/requires-fix condition or a completed checklist
- Zero critical accessibility regressions (`Critical a11y violations = 0`) when this task relates to QA.
- Performance gates:
  - PageSpeed >= 90 (mobile and desktop) when this task relates to Phase 8.

## References
Use markdown links to the exact files from this repo, and in each bullet mention which section you used.
- [`04-nextjs-implementation-spec.md`](../04-nextjs-implementation-spec.md) — sections: Server/Client boundaries, cache strategy, streaming, Atomic Design
- [`05-ai-design-match-performance-and-qa.md`](../05-ai-design-match-performance-and-qa.md) — sections: quality gates, fix-loop
- [`06-premium-pen-and-faang-ux-ui-standards.md`](../06-premium-pen-and-faang-ux-ui-standards.md) — sections: production states, FAANG quality bar, Primary CTA policy
- [`07-motion-and-microinteractions-guidelines.md`](../07-motion-and-microinteractions-guidelines.md) — sections: motion tokens, reduced motion behavior
- [`08-pagespeed-green-zone-playbook.md`](../08-pagespeed-green-zone-playbook.md) — sections: diagnose->fix->verify, release gate
```

