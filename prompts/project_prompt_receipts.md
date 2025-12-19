# Рекомендации по промптам для проекта WordPress Theme + Carbon Fields + Docker

> [!IMPORTANT]
> Данный документ содержит частные рекомендации по составлению промптов, специфичные для разработки WordPress темы с использованием Carbon Fields, Docker и кастомных плагинов.

---

## Стек технологий проекта

| Компонент | Технология | Версия |
|-----------|------------|--------|
| CMS | WordPress | 6.x |
| Custom Fields | Carbon Fields | 3.6+ |
| Контейнеризация | Docker | latest |
| База данных | MySQL | 8.0 |
| Язык backend | PHP | 8.1+ |
| Frontend | HTML, CSS, JavaScript | ES6+ |
| AI IDE | Cursor AI | latest |

---

## 1. Базовые системные промпты для проекта

### 1.1 Универсальный контекст проекта

Добавляйте этот контекст в начало каждого промпта:

```markdown
# Контекст проекта
Ты работаешь над WordPress темой со следующими характеристиками:
- CMS: WordPress 6.x
- Кастомные поля: Carbon Fields 3.6 (установлен через Composer)
- Контейнеризация: Docker с MySQL 8.0
- PHP: версия 8.1+
- Кодинг стандарты: WordPress Coding Standards
- Структура: MVC-подобная с разделением logic/presentation

Вдохни глубоко и приступай к работе шаг за шагом.
```

### 1.2 Роли для различных задач

#### Backend разработка (PHP/WordPress)

```markdown
Ты — Senior WordPress Developer с 10+ годами опыта разработки 
кастомных тем и плагинов. Ты эксперт в:
- WordPress Plugin API и Theme API
- Carbon Fields для кастомных полей
- Безопасности WordPress (sanitize, escape, nonce)
- REST API и Ajax
- Оптимизации производительности
```

#### Frontend разработка

```markdown
Ты — Frontend Developer, специализирующийся на WordPress темах:
- Создаёшь семантическую и доступную HTML разметку
- Пишешь модульный CSS с использованием BEM методологии
- JavaScript ES6+ с акцентом на производительность
- Знаешь специфику wp_enqueue_script/style
```

#### DevOps / Docker

```markdown
Ты — DevOps инженер с опытом контейнеризации WordPress:
- Настройка docker-compose для WordPress + MySQL
- Оптимизация PHP-FPM и Nginx/Apache
- Персистентность данных и volumes
- Удобство разработки (hot-reload, debug)
```

---

## 2. Промпты для Carbon Fields

### 2.1 Создание контейнеров полей

```markdown
Создай контейнер Carbon Fields для [тип: post_meta/theme_options/term_meta] 
со следующими характеристиками:

# Контекст
- Контейнер для: [страница/тип записи/опции темы]
- Расположение: [sidebar/normal/advanced]
- Приоритет: [high/core/default/low]

# Необходимые поля
1. [Название поля] - [тип поля] - [описание назначения]
2. ...

# Требования
- Используй namespace \Carbon_Fields\Container и \Carbon_Fields\Field
- Добавь hook 'carbon_fields_register_fields' 
- Добавь метки на русском языке
- Включи валидацию где необходимо
- Добавь условную логику (conditional logic) если требуется

# Формат вывода
PHP код с PHPDoc комментариями
```

### 2.2 Шаблон для Complex Fields

```markdown
Создай Complex (repeater) поле Carbon Fields:

# Структура
- Название группы: [название]
- Лейбл: [лейбл на русском]
- Максимум элементов: [число или unlimited]

# Вложенные поля
1. [Поле 1]: [тип] — [описание]
2. [Поле 2]: [тип] — [описание]
...

# Дополнительно
- Layout: [tabbed/grid/list]
- Collapsed: [true/false]
- Кнопка добавления: [текст]

Покажи также пример получения данных через carbon_get_* функции.
```

### 2.3 Работа с Gutenberg блоками

```markdown
Создай кастомный Gutenberg блок с использованием Carbon Fields:

# Блок
- Slug: [slug]
- Название: [название]
- Иконка: [dashicon или SVG]
- Категория: [widgets/common/custom]

# Поля блока
1. [Поле]: [тип]
...

# Рендеринг
- Создай template для отображения блока
- Добавь стили специфичные для блока
- Учти preview в редакторе
```

---

## 3. Промпты для разработки темы

### 3.1 Создание template parts

```markdown
Создай template part для WordPress темы:

# Назначение
[Описание части шаблона, например: шапка сайта с навигацией]

# Требования
- Используй get_template_part() семантику
- Включи поддержку carbon_get_* для динамических данных
- Добавь escape-функции для всего вывода
- Используй семантический HTML5
- Добавь классы по BEM методологии

# Переменные
Доступные через set_query_var:
- [переменная 1]: [описание]
...

# Формат
1. PHP template файл
2. Пример вызова из parent template
```

### 3.2 Настройка functions.php

```markdown
Добавь функционал в functions.php темы:

# Задача
[Описание функционала]

# Требования
- Используй WordPress Hook API (add_action/add_filter)
- Именуй функции с префиксом темы: mytheme_*
- Добавь PHPDoc для каждой функции
- Учти производительность (lazy load, caching где применимо)
- Следуй принципу единственной ответственности

# Hooks для использования
[Если известны конкретные хуки]

# Безопасность
- sanitize для input
- escape для output  
- nonce для форм
- capability checks для admin
```

### 3.3 REST API endpoints

```markdown
Создай кастомный REST API endpoint для темы:

# Endpoint
- Route: /wp-json/mytheme/v1/[endpoint]
- Methods: [GET/POST/PUT/DELETE]
- Требуется авторизация: [да/нет]

# Параметры
| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| param1   | string | да | описание |
...

# Ответ
```json
{
  "success": true,
  "data": {}
}
```

# Требования
- register_rest_route с validate_callback
- Sanitization всех параметров
- Permission callback
- Proper error responses
```

---

## 4. Промпты для Docker

### 4.1 Настройка docker-compose

```markdown
Создай/обнови docker-compose.yml для WordPress разработки:

# Сервисы
1. WordPress (PHP-FPM или Apache)
2. MySQL 8.0
3. [Опционально: phpMyAdmin, Mailhog, Redis]

# Требования
- Volumes для персистентности данных
- Маппинг темы в контейнер для разработки
- Переменные окружения в .env файле
- Expose порты: [список]
- Network для связи сервисов

# Debug
- Включи XDEBUG для PHP
- WP_DEBUG = true

# Формат
docker-compose.yml с комментариями
```

### 4.2 Dockerfile для кастомного образа

```markdown
Создай Dockerfile для WordPress разработки:

# Базовый образ
wordpress:php8.1-fpm (или apache)

# Дополнительно установить
- Composer
- WP-CLI
- [PHP extensions: если нужны]

# Конфигурация
- php.ini настройки для разработки
- upload_max_filesize = 64M
- memory_limit = 256M
- XDEBUG configuration
```

---

## 5. Промпты для разработки плагина

### 5.1 Структура плагина

```markdown
Создай структуру кастомного WordPress плагина:

# Название плагина
[Название]

# Назначение
[Описание функционала плагина]

# Структура директорий
```
plugin-name/
├── plugin-name.php          # Главный файл
├── includes/                # PHP классы
├── admin/                   # Админ часть
├── public/                  # Публичная часть
├── templates/               # Шаблоны
├── assets/                  # CSS, JS, images
└── languages/               # Переводы
```

# Требования
- OOP структура с autoloader
- Singleton для главного класса
- Activation/Deactivation hooks
- Uninstall.php для очистки
- Поддержка i18n

Создай главный файл плагина с заголовками и базовой структурой.
```

### 5.2 Custom Post Types и Taxonomies

```markdown
Создай Custom Post Type для плагина:

# CPT
- Slug: [slug]
- Singular: [единственное число]
- Plural: [множественное число]
- Иконка: [dashicon]

# Supports
[title, editor, thumbnail, excerpt, comments, etc.]

# Taxonomies (если нужны)
1. [Taxonomy 1]: hierarchical [да/нет]
...

# Meta Fields
Интеграция с Carbon Fields для мета-полей CPT

# Требования
- Правильная регистрация на init hook
- Flush rewrite rules при активации
- Labels на русском языке
- Capabilities mapping
```

---

## 6. Промпты для отладки и оптимизации

### 6.1 Отладка проблем

```markdown
Помоги отладить проблему:

# Симптомы
[Описание проблемы]

# Код
```php
[Проблемный код]
```

# Ожидаемое поведение
[Что должно происходить]

# Фактическое поведение
[Что происходит на самом деле]

# Уже пробовали
[Что уже проверяли]

# Окружение
- WordPress: [версия]
- PHP: [версия]
- Carbon Fields: [версия]
- Docker: [да/нет]

Проанализируй проблему пошагово и предложи решения 
с объяснением причин.
```

### 6.2 Оптимизация производительности

```markdown
Проведи ревью кода на предмет производительности:

```php
[Код для ревью]
```

# Фокус
- Database queries (N+1 проблемы)
- Кэширование (transients, object cache)
- Asset loading (enqueue оптимизация)
- DOM queries в JavaScript
- Lazy loading

# Требования
- Укажи конкретные проблемы
- Предложи оптимизированные версии
- Оцени потенциальный прирост
```

---

## 7. Шаблоны для Cursor AI Rules

### 7.1 .cursor/rules/wordpress.mdc

```markdown
---
description: WordPress Theme Development Guidelines
---

# WordPress Coding Standards
- Следуй WordPress PHP Coding Standards
- Используй табуляцию для отступов
- Пробелы внутри скобок: ( $var )
- Yoda conditions: if ( true === $var )

# Security
- Всегда escape output: esc_html(), esc_attr(), esc_url()
- Sanitize input: sanitize_text_field(), absint()
- Используй nonce для форм
- Проверяй capabilities перед изменениями

# Naming
- Функции: mytheme_function_name
- Классы: MyTheme_Class_Name
- Constants: MYTHEME_CONSTANT
- Hooks: do_action('mytheme_hook_name')

# Carbon Fields
- Префикс полей: mytheme_
- Используй get_helper functions
- Избегай raw DB queries для мета
```

### 7.2 .cursor/rules/docker.mdc

```markdown
---
description: Docker Development Guidelines
---

# Docker Compose
- Все сервисы в одном docker-compose.yml
- Переменные в .env файле
- Named volumes для персистентности
- Отдельная сеть для изоляции

# Development vs Production  
- Используй multi-stage builds
- Разные конфиги для dev/prod
- Development не должен содержать prod secrets
```

---

## 8. Примеры готовых промптов

### 8.1 Создание страницы настроек темы

```markdown
# Роль
Ты — Senior WordPress Developer с экспертизой в Carbon Fields.

# Контекст
Проект: WordPress тема с Docker
Stack: Carbon Fields 3.6+, PHP 8.1, WordPress 6.x

# Задача
Создай страницу настроек темы (Theme Options) с Carbon Fields.

# Требования к полям
1. Секция "Общие настройки"
   - Логотип (image)
   - Телефон (text)
   - Email (text с валидацией)
   - Адрес (textarea)

2. Секция "Социальные сети"
   - Complex field с полями:
     - Иконка (select: facebook, instagram, telegram, etc.)
     - URL (text)

3. Секция "Footer"
   - Копирайт (text)
   - Текст подвала (rich_text)

# Дополнительно
- Создай helper-функции для получения данных
- Добавь условную логику где нужно
- Используй tabs для группировки секций
- Включи SVG логотип поддержку

Вдохни глубоко и работай пошагово. 
Это важно для запуска проекта.
```

### 8.2 Настройка Docker окружения

```markdown
# Роль
Ты — DevOps инженер, специализирующийся на WordPress.

# Контекст
- Новый проект WordPress темы
- Нужна локальная разработка
- Удобство и скорость development приоритет

# Задача
Настрой Docker окружение для разработки.

# Сервисы
1. WordPress + PHP 8.1 FPM
2. Nginx
3. MySQL 8.0
4. phpMyAdmin
5. Mailhog (для отладки email)

# Требования
- Mapping текущей папки темы в /var/www/html/wp-content/themes/mytheme
- Отдельный volume для uploads
- XDebug для PHP debugging
- WP_DEBUG включён
- .env для переменных

# Формат вывода
1. docker-compose.yml
2. nginx/default.conf
3. .env.example
4. README с инструкцией запуска

Работай пошагово, начни с docker-compose.
```

---

## 9. Чеклист для промптов проекта

### Перед отправкой промпта проверьте:

- [ ] Указан контекст проекта (WordPress, Carbon Fields, Docker)
- [ ] Определены версии технологий
- [ ] Указан желаемый формат вывода
- [ ] Добавлены требования безопасности
- [ ] Включена фраза для активации качественного режима
- [ ] Задача разбита на логические шаги
- [ ] Указаны примеры если нужно pattern matching

---

## 10. Anti-patterns для проекта

### Чего избегать в промптах:

| ❌ Плохо | ✅ Хорошо |
|----------|-----------|
| "Создай тему WordPress" | "Создай functions.php с регистрацией Carbon Fields контейнера для hero-секции главной страницы" |
| "Настрой Docker" | "Добавь сервис Redis в docker-compose.yml с persistent volume и connection к WordPress" |
| "Исправь баг" | "В функции mytheme_get_hero_data() вызов carbon_get_theme_option возвращает null. Проверь hook порядок и container ID" |
| "Оптимизируй" | "Оптимизируй Query в функции get_recent_posts(): сейчас 12 запросов на страницу, нужно свести к 2" |

---

## Заключение

> [!TIP]
> Сохраните этот документ и используйте шаблоны как отправную точку. 
> Адаптируйте под конкретные задачи, добавляя специфичные детали.

Эффективные промпты для WordPress + Carbon Fields + Docker проекта должны:

1. **Устанавливать контекст** — стек технологий, версии, стандарты
2. **Назначать экспертную роль** — конкретная специализация
3. **Детализировать требования** — поля, структура, формат
4. **Включать безопасность** — sanitize, escape, nonce
5. **Задавать формат вывода** — код, документация, примеры
6. **Использовать психологические триггеры** — важность, пошаговость

---

## Связанные документы

- [Общие рекомендации по промптам](general_prompt_guidelines.md)
- Документация Carbon Fields: https://carbonfields.net/docs/
- WordPress Coding Standards: https://developer.wordpress.org/coding-standards/
- Docker WordPress: https://hub.docker.com/_/wordpress
