# Шаблон: детализированные wireframes (mobile/tablet/desktop)

## 1. Метаданные страницы

- Страница:
- Route:
- Версия:
- Автор:
- Дата:
- Primary CTA:
- Secondary CTA:
- Бизнес-цель:
- Целевая аудитория:

## 2. IA и flow context

- Входная точка пользователя:
- Предыдущий шаг:
- Следующий шаг:
- Ключевой пользовательский сценарий:
- Альтернативные сценарии:

## 3. Глобальные регионы страницы

- Header:
- Navigation:
- Main content:
- Supporting content (aside/secondary):
- Footer:
- Overlay zones (modal/sheet/popover/toast):

## 4. Wireframe: Mobile

### 4.1 Layout map (top -> bottom)

| Region ID | Название региона | Цель | Контент | Компоненты | Priority |
|---|---|---|---|---|---|
| M-01 |  |  |  |  | High/Medium/Low |

### 4.2 Поведение и интеракции

- Основной путь к Primary CTA:
- Sticky/fixed элементы:
- Логика раскрытия вторичных блоков:
- Особенности scroll-behavior:

### 4.3 Состояния (обязательно)

- `empty`:
- `loading`:
- `error`:
- `forbidden`:
- `success` (если применимо):

## 5. Wireframe: Tablet

### 5.1 Layout map (top -> bottom)

| Region ID | Название региона | Цель | Контент | Компоненты | Priority |
|---|---|---|---|---|---|
| T-01 |  |  |  |  | High/Medium/Low |

### 5.2 Поведение и интеракции

- Изменения относительно mobile:
- Ключевые differences в иерархии:
- Поведение навигации:

### 5.3 Состояния (обязательно)

- `empty`:
- `loading`:
- `error`:
- `forbidden`:
- `success` (если применимо):

## 6. Wireframe: Desktop

### 6.1 Layout map (top -> bottom)

| Region ID | Название региона | Цель | Контент | Компоненты | Priority |
|---|---|---|---|---|---|
| D-01 |  |  |  |  | High/Medium/Low |

### 6.2 Поведение и интеракции

- Изменения относительно tablet:
- Распределение фокуса и визуальной иерархии:
- Поведение secondary regions:

### 6.3 Состояния (обязательно)

- `empty`:
- `loading`:
- `error`:
- `forbidden`:
- `success` (если применимо):

## 7. Кросс-breakpoint rules

- Что должно быть строго одинаковым на всех breakpoints:
- Что может отличаться:
- Где запрещены structural deviations:

## 8. Component mapping (wireframe -> implementation)

| Region ID | Предполагаемый уровень Atomic | Планируемый компонент | Server/Client | Комментарий |
|---|---|---|---|---|
| M-01 / T-01 / D-01 | atom/molecule/organism/template |  | Server/Client |  |

## 9. Motion и accessibility notes

- Motion intent по регионам:
- `prefers-reduced-motion` fallback:
- Focus order:
- Keyboard path:
- Контраст/читаемость риски:

## 10. Handoff readiness

- [ ] Структура и регионы согласованы с IA.
- [ ] Primary CTA консистентен с метаданными.
- [ ] Все состояния описаны для mobile/tablet/desktop.
- [ ] Нет неоднозначных трактовок для этапа `.pen`.
- [ ] Документ готов как source of truth для `.pen`-дизайна.
