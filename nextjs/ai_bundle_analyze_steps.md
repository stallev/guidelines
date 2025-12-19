# Next.js Bundle Optimization & Analyze Guidelines

Этот документ объединяет две части:
1. **Принципы оптимизации bundle** (как писать код, чтобы не раздувать клиентский JavaScript).
2. **Автоматизированные шаги анализа** (как запускать `bundle:report`, парсить результаты и документировать выводы).

Применяется к любым React/Next.js задачам в проекте.

---

## 1. 🎯 Основные принципы оптимизации

1. **Server Components по умолчанию**: вся логика без интерактивности выполняется на сервере. Client-компоненты только для `useState`, событий или браузерных API.
2. **Серверная подготовка данных**: форматирование/сортировки/агрегации делаем в server actions. Клиент получает готовые строки и массивы без повторных вычислений.
3. **Точечные client-острова**: разбивайте UI на небольшие client-компоненты. Крупные контейнеры с десятками зависимостей запрещены.
4. **Динамические импорты**: тяжёлые библиотеки (`react-day-picker`, drag&drop, редакторы, графики) подключайте через `next/dynamic`/`import()` в месте использования. Для `ssr: false` добавляйте skeleton.
5. **Точный импорт**: иконки/утилиты импортируйте адресно. Никаких `import * as Icons`.
6. **Минимум зависимостей**: прежде чем ставить новую библиотеку, ищите аналог в проекте или реализуйте лёгкий вариант. Любое подключение должно сопровождаться обоснованием влияния на bundle.

---

## 2. 🔍 Контроль и аналитика

1. **Регулярные проверки**: после завершения значимых UI-блоков запускайте `npm run bundle:report`.
2. **Лимиты**: целевой gzip ≤ 150 KB на страницу/панель. При превышении обязательно описываем причину и действия по снижению.
3. **Трассировка зависимостей**: если страница внезапно «утяжелилась», используйте `next build --profile` или `why bundld`-подобные инструменты, чтобы найти источник.
4. **Lazy загрузка**: редко используемые компоненты (редакторы, модалки, графики) подключайте только по событию.

---

## 3. 🛠 Паттерны оптимизации

### 3.1. Серверная агрегация
- Собирайте текст, сортируйте массивы, объединяйте данные в server actions / Route Handlers.
- Клиенту передавайте сериализованные DTO.

### 3.2. Разделение клиентских модулей
- Списки, таблицы, карточки — серверные. Кнопки/формы — отдельные client-файлы.
- Общие UI-блоки (cards, badges) держите в серверных компонентах.

### 3.3. Динамические импорты
- Пример:
  ```ts
  const Widget = dynamic(() => import('./Widget'), {
    ssr: false,
    loading: () => <Skeleton />,
  });
  ```
- Не поднимайте динамический импорт на уровень выше, чем необходимо.

### 3.4. Библиотеки и иконки
- `lucide-react`: импорт по одному символу (`import { Eye } from 'lucide-react'`).
- `sonner`, `react-day-picker`, `@dnd-kit` и т.п. подключайте там, где они реально используются, и по возможности лениво.

### 3.5. CSS/медиа
- Используйте `next/image` с корректными `priority`/`loading`.
- Tailwind классы собирайте без дополнительных рантайм-библиотек. Избегайте динамических классов на клиенте, если можно отрендерить разные ветки на сервере.

---

## 4. ✅ Чек-лист перед ревью

- [ ] Компонент серверный по умолчанию, `'use client'` только там, где нужно.
- [ ] Все тяжёлые зависимости подключены динамически/лениво.
- [ ] Данные приходят уже в готовом формате (типизация + сериализация).
- [ ] Кнопки/обработчики вынесены в небольшие client-компоненты.
- [ ] Выполнен `npm run bundle:report` и задокументированы результаты.
- [ ] В PR описано, как изменения сказались на bundle (в цифрах).

---

## 5. 📚 Полезные ссылки
- [Vercel: Optimizing](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Bundle Analyzer](https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer)
- [Dynamic import / lazy loading](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [Server Components](https://nextjs.org/docs/app/building-your-application/routing/server-components)

---

## 6. ⚙️ Автоматизированный анализ bundle

### 6.1. Настройки
1. Зависимости (уже добавлены в проект):
   ```bash
   npm install -D @next/bundle-analyzer cross-env
   ```
2. В `next.config.ts` обернуть конфиг в analyzer:
   ```ts
   import bundleAnalyzer from '@next/bundle-analyzer';
   const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });
   export default withBundleAnalyzer(nextConfig);
   ```
3. Скрипты в `package.json`:
   ```json
   "scripts": {
     "analyze": "cross-env ANALYZE=true next build --webpack",
     "bundle:report": "tsx scripts/analyze-bundle.ts"
   }
   ```
   > Используем `--webpack`, потому что Turbopack пока не поддерживается analyzer.

### 6.2. Скрипт `scripts/analyze-bundle.ts`
Ниже приведён полный код, который можно переиспользовать в других проектах:

```ts
import { spawnSync } from 'node:child_process';
import { readFileSync, appendFileSync, existsSync } from 'node:fs';
import path from 'node:path';

type BundleEntry = {
  label?: string;
  statSize?: number;
  parsedSize?: number;
  gzipSize?: number;
};

type ParsedReport = {
  name: string;
  statSize: number;
  parsedSize: number;
  gzipSize: number;
  topEntries: BundleEntry[];
};

const REPORTS_DIR = path.resolve('.next/analyze');
const REPORT_FILES = ['client.html', 'edge.html', 'nodejs.html'];
const BUNDLE_REPORT_MD = path.resolve('docs/metrics/bundle_reports.md');
const TOP_COUNT = 5;

function runAnalyzeBuild() {
  console.log('Running `npm run analyze` to generate bundle stats...\\n');
  const result = spawnSync('npm', ['run', 'analyze'], { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) {
    throw new Error('Bundle analyze build failed. See output above for details.');
  }
}

function extractChartData(htmlContent: string): BundleEntry[] | null {
  const match = htmlContent.match(/window\\.chartData\\s*=\\s*(\\[[\\s\\S]*?\\]);/);
  if (!match) {
    return null;
  }
  try {
    return JSON.parse(match[1]);
  } catch (error) {
    console.error('Failed to parse chartData JSON:', error);
    return null;
  }
}

function summarizeReport(name: string, entries: BundleEntry[] | null): ParsedReport {
  if (!entries || entries.length === 0) {
    return { name, statSize: 0, parsedSize: 0, gzipSize: 0, topEntries: [] };
  }

  const statSize = entries.reduce((acc, item) => acc + (item.statSize || 0), 0);
  const parsedSize = entries.reduce((acc, item) => acc + (item.parsedSize || 0), 0);
  const gzipSize = entries.reduce((acc, item) => acc + (item.gzipSize || 0), 0);
  const topEntries = [...entries]
    .sort((a, b) => (b.parsedSize || 0) - (a.parsedSize || 0))
    .slice(0, TOP_COUNT);

  return { name, statSize, parsedSize, gzipSize, topEntries };
}

function formatBytes(value: number): string {
  if (value === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let index = 0;
  let number = value;
  while (number >= 1024 && index < units.length - 1) {
    number /= 1024;
    index += 1;
  }
  return `${number.toFixed(2)} ${units[index]}`;
}

function appendReportMarkdown(reports: ParsedReport[]) {
  const timestamp = new Date().toISOString();
  const lines: string[] = [];

  lines.push(`## ${timestamp}`);
  lines.push('- **Command**: `npm run analyze` (авто, через `npm run bundle:report`)');

  reports.forEach((report) => {
    lines.push(`- **${report.name} bundle**: stat=${formatBytes(report.statSize)}, parsed=${formatBytes(report.parsedSize)}, gzip=${formatBytes(report.gzipSize)}`);
    if (report.topEntries.length === 0) {
      lines.push('  - Нет данных (анализатор не сформировал список модулей)');
    } else {
      report.topEntries.forEach((entry, index) => {
        const label = entry.label || 'unknown';
        lines.push(`  - Top ${index + 1}: \\`${label}\\` — parsed=${formatBytes(entry.parsedSize || 0)}, gzip=${formatBytes(entry.gzipSize || 0)}`);
      });
    }
  });

  lines.push('- **Оптимизация**: проанализируйте крупные чанки и примените серверные/динамические паттерны при необходимости.');
  lines.push('');

  appendFileSync(BUNDLE_REPORT_MD, `${lines.join('\\n')}\\n`);
  console.log(`Bundle report appended to ${BUNDLE_REPORT_MD}`);
}

function main() {
  runAnalyzeBuild();

  if (!existsSync(REPORTS_DIR)) {
    throw new Error(`Reports directory not found: ${REPORTS_DIR}`);
  }

  const parsedReports = REPORT_FILES.map((file) => {
    const filePath = path.join(REPORTS_DIR, file);
    if (!existsSync(filePath)) {
      console.warn(`Report file not found: ${filePath}`);
      return summarizeReport(file.replace('.html', ''), null);
    }
    const raw = readFileSync(filePath, 'utf-8');
    const data = extractChartData(raw);
    return summarizeReport(file.replace('.html', ''), data);
  });

  appendReportMarkdown(parsedReports);
}

main();
```

### 6.3. Запуск анализа
1. `npm run bundle:report` — основной сценарий (запускает сборку и парсинг).
2. Если нужно лишь пересоздать отчёты без парсинга, выполните `npm run analyze`.
3. После сборки ищите отчёты в `.next/analyze/client|edge|nodejs.html`.
4. Сообщение “Analyzer will show only original module sizes” — нормальное поведение для гибридных сборок.

### 6.4. Извлечение чисел
- Скрипт автоматически добавляет запись в `docs/metrics/bundle_reports.md`.
- При необходимости можно вручную проанализировать HTML (например, через Python). Главное — зафиксировать `stat/parsed/gzip` и топ-5 чанков.

### 6.5. Документирование
1. Проверьте `docs/metrics/bundle_reports.md`: должна появиться свежая запись с меткой времени.
2. Если запускали анализ вручную — добавьте запись самостоятельно в указанном формате.
3. В PR/задаче укажите, какой вклад в bundle дали изменения и какие действия планируются при превышении лимитов.

### 6.6. После анализа
- Обнаружили крупные чанки? Составьте план оптимизации (серверизация, dynamic import, разделение client-островков).
- После оптимизаций повторите `npm run bundle:report`, чтобы зафиксировать улучшения.
- Всегда указывайте в описании задач, насколько уменьшился/вырос bundle (в KB/MB).

### 6.7. CI (опция на будущее)
- Можно добавить шаг `npm run bundle:report` в GitHub Actions/GitLab CI.
- Пайплайн может:
  - сохранять `.next/analyze/*.html` как артефакты;
  - сравнивать размеры с предыдущим запуском и падать при превышении порога;
  - публиковать автоматические комментарии с метриками.
- Эта интеграция будет реализована позже, но архитектура скрипта уже готова к использованию в CI.

---

Следование этому гайду обязательно после завершения любого блока, который влияет на client bundle. Это гарантирует, что проект остаётся в пределах целевых размеров, а все участники понимают текущую картину по весу приложения и знают, какие шаги предпринять для оптимизации.
