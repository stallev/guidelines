# Этап 7. Motion и microinteractions guidelines

## Цель

Сделать анимации системной частью UX: понятной, доступной и безопасной для производительности.

## Принципы

- Motion объясняет изменение состояния, а не служит декоративным слоем.
- Анимации помогают пользователю ориентироваться в интерфейсе.
- Каждая анимация имеет явную UX-цель: feedback, continuity, emphasis или guidance.

## Система motion-токенов

Обязательные токены:

- `duration-fast` (micro feedback)
- `duration-base` (стандартные переходы)
- `duration-slow` (сложные переходы, ограниченно)
- `ease-standard`
- `ease-emphasized`
- `ease-exit`

Рекомендуемые диапазоны:

- micro interactions: `100-200ms`
- стандартные переходы: `200-300ms`
- сложные переходы: `300-400ms` (только при обосновании)

## Разрешенные типы анимаций

Приоритет:

- `opacity`
- `transform` (`translate`, `scale` в умеренном диапазоне)

Избегать в критичных сценариях:

- анимации `width/height/top/left` в частых интеракциях;
- тяжелые `blur/filter` эффекты на больших областях;
- непрерывные декоративные циклы без UX-функции.

## Choreography и иерархия движения

- В один момент времени есть один главный фокус движения.
- Вход и выход связанных элементов синхронизированы по таймингу.
- Последовательные стадии не конфликтуют и не перегружают восприятие.

## Microinteractions по сценариям

### 1) Controls

- `hover/focus/active` дают быстрый и ясный feedback.
- Loading-состояния у CTA блокируют повторный submit и объясняют ожидание.

### 2) Async-зоны

- Skeleton/placeholder фиксируют границы подгружаемого контента.
- Переход к loaded state исключает резкие layout-сдвиги.

### 3) Navigation и overlays

- Opening/closing модалок и меню использует предсказуемый motion-паттерн.
- `backdrop` и `content` анимации синхронизированы.

## Accessibility и reduced motion

- Обязательна поддержка `prefers-reduced-motion`.
- Для `reduce` несущественные анимации отключаются или упрощаются.
- Сложные перемещения заменяются мягкими opacity transitions.
- Анимации не должны создавать фоточувствительные и вестибулярные триггеры.

Базовый CSS-паттерн:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Performance guardrails

- Анимации не ухудшают Core Web Vitals и субъективную плавность UI.
- Motion в above-the-fold не мешает LCP.
- Интерактивные анимации не деградируют INP на типичных устройствах.
- Layout stability обязательна: анимации не создают неожиданных CLS.

## Валидация качества motion

Для каждой страницы фиксируются:

- список анимируемых регионов и UX-цель;
- токены `duration/easing`;
- reduced-motion behavior;
- риски производительности и принятые mitigation.

## Критерии готовности

- Motion-сценарии согласованы на всех breakpoints.
- `prefers-reduced-motion` поддержан.
- Нет блокирующих дефектов по UX/a11y/performance.
