# Этап 5. AI Design Match, performance и QA после каждой страницы

## Цель этапа

Автоматически проверять соответствие реализации `.pen`-макету и одновременно контролировать качество UX через a11y и Core Web Vitals.

## Обязательное правило

Проверка запускается:

- после завершения **каждой** страницы;
- после **каждого** цикла исправлений до статуса `pass`.

## Контур проверки

- `DesignModel` из `.pen` (структура, токены, layout, состояния).
- `ImplModel` из DOM/CSSOM + компонентной структуры.
- `WireframeModel` из markdown-спецификации (структура, регионы, primary CTA, state expectations).
- Diff-оценка по категориям:
  - structure;
  - tokens;
  - spacing/typography;
  - interactions/states;
  - motion;
  - accessibility;
  - visual.

## Инструменты

- Playwright для визуальных и структурных проверок.
- axe-core для автоматической a11y-валидации.
- Lighthouse/PageSpeed для lab/field performance сигналов.
- `web-vitals` для RUM-метрик в проде.

## Quality gates

Минимальные пороги:

- Structure match `>= 0.90`.
- Token match `>= 0.95`.
- Critical a11y violations `= 0`.
- Contrast AA = pass.
- Visual diff <= project threshold.
- PageSpeed:
  - mobile `>= 90`
  - desktop `>= 90`
- Core Web Vitals (p75):
  - `LCP <= 2.5s`
  - `INP <= 200ms`
  - `CLS <= 0.1`
- `prefers-reduced-motion` поведение проверено и не ломает UX.

## Fix-loop процесс

1. Классифицировать дефекты: `P0`, `P1`, `P2`.
2. Исправлять строго в порядке `P0 -> P1 -> P2`.
3. Перезапускать AI Design Match и quality suite.
4. Закрывать страницу только при полном прохождении порогов.

## Проверки high-conversion

- CTA на странице заметен и доступен в ключевых точках сценария.
- Форма не содержит лишних полей и не блокирует понятное завершение действия.
- Trust-блоки присутствуют в согласованных местах.
- Нет визуальных или интерактивных дефектов, ухудшающих конверсию.
- Primary CTA соответствует wireframe metadata и не теряется на mobile/tablet/desktop.

## Motion QA checks

- Анимации имеют функциональную цель (feedback/continuity/guidance).
- Нет конфликтующих или избыточных анимаций в одном контексте.
- Анимации не деградируют perceived performance.
- Для reduced-motion пользователей предусмотрен безопасный fallback.

## Формат решения по странице

- `pass` - все quality gates пройдены.
- `requires-fix` - есть блокирующие отклонения.

## Definition of Done

- Страница получила `pass`, артефакт отчета сохранен, регрессии не обнаружены.
- PageSpeed и CWV находятся в целевой green zone для целевых страниц.
