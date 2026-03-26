# Этап 3. `.pen` дизайн-система и page specification

## Цель этапа

Подготовить однозначный premium `.pen`-макет на основе утвержденных wireframes, который задает структуру, визуальный слой, поведение и состояния компонентов для точной реализации в Next.js.

## Входные артефакты (обязательно)

Перед началом работы с `.pen` должны существовать:

- IA и page content spec (этап 2);
- wireframe markdown-документ (mobile/tablet/desktop);
- поле `Primary CTA` в метаданных wireframe.

## Обязательные требования

### 1) Покрытие breakpoints

Для каждой страницы обязательно:

- `mobile`
- `tablet`
- `desktop`

### 2) Системные экраны и состояния (production mindset)

Обязательные сущности в `.pen`:

- адаптивное меню (closed/open/focus/active);
- модальные формы (default/loading/error/success);
- уведомления (info/success/warning/error);
- page-level состояния: `empty/loading/error/forbidden`;
- состояния элементов управления:
  - `input`: default/focus/filled/error/disabled;
  - `button`: default/hover/focus/active/loading/disabled;
  - `link`: default/hover/focus/visited/active.

### 3) Дизайн-токены

Styleguide должен включать:

- типографику;
- цветовые токены (brand/surface/text/border/semantic);
- spacing/radius/shadow/elevation;
- motion-токены (durations/easing) для интерактивных сценариев.

### 4) Premium quality bar

Для каждой страницы обязательно:

- четкая визуальная иерархия с одним главным фокусом;
- консистентность терминов, паттернов и primary action;
- progressive disclosure без перегрузки MVP-экрана;
- trust/privacy-паттерны в сценариях с чувствительными данными.

## Atomic Design mapping

В `.pen` каждый элемент должен быть классифицирован:

- `atoms`: базовые UI-элементы;
- `molecules`: простые композиции;
- `organisms`: функциональные крупные блоки;
- `templates`: каркас страницы;
- `pages`: финальные экземпляры с контентом.

Это mapping используется в коде для зеркальной структуры компонентов.

## Wireframe -> `.pen` mapping

Для каждого ключевого региона фиксируется:

- `wireframe region id`;
- соответствующий `.pen` node/group;
- ожидаемый уровень atomic-композиции;
- различия между `mobile/tablet/desktop` с кратким rationale.

## Правила работы с референсами

- Анализируйте паттерны композиции и UX-решений, не копируя брендинг и уникальные элементы.
- Любое заимствование переводите в собственные токены и компонентные правила.
- Фиксируйте, какие паттерны приняты и какие отклонены.

## Motion и accessibility в `.pen`

- Motion применяется как UX-инструмент (feedback, continuity, guidance), а не как декоративный слой.
- Поведение для `prefers-reduced-motion` должно быть описано в page spec.
- Контраст, читаемость и focus path должны быть проверяемы до передачи в разработку.

## Готовность к передаче в разработку

- Никаких неоднозначных состояний.
- Имена узлов в `.pen` консистентны и пригодны для автоматизированной сверки.
- Контентные контейнеры и responsive-правила описаны явно.
- Wireframe-структура сохранена без скрытых structural deviations.

## Критерии готовности

- `.pen` покрывает все пользовательские и системные сценарии и готов к 1:1 реализации.
- Premium quality bar и FAANG-level UX/UI требования соблюдены.
