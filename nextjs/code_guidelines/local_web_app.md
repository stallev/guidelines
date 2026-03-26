# Локальный запуск web-приложения (`apps/web`)

Краткий runbook для разработки фронтенда в этом репозитории.

## Требования

- **Node.js** 20.9+ (ориентируйтесь на `engines` вашего корневого `package.json`)
- **npm** (рекомендуется; используются npm workspaces)

## Установка зависимостей

Из **корня репозитория** (где лежит workspace):

```bash
npm install
```

Зависимости подтягиваются для целевого web-пакета вашего workspace.

## Разработка

Из корня:

```bash
npm run dev
```

Или из каталога приложения:

```bash
cd apps/web
npm run dev
```

По умолчанию: [http://localhost:3000](http://localhost:3000).

Сборка по умолчанию использует **Turbopack** в current stable Next.js.

## Продакшен-сборка локально

```bash
npm run build
npm run start
```

(из корня; эквивалентно `npm run build` / `npm run start` в `apps/web`.)

## Опционально: Webpack

Если нужен обходной путь под кастомный Webpack (редко, см. ADR-022):

```bash
cd apps/web
npm run build:webpack
npm run dev:webpack
```

## Переменные окружения

### Local Development Setup

1. Copy the example file:
   ```bash
   cp apps/web/.env.local.example apps/web/.env.local
   ```

2. Populate the required variables in `apps/web/.env.local`:
   - **Database credentials** — `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) from Neon Console
   - **Auth settings** — `AUTH_SECRET` (generate with `openssl rand -base64 32`), `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` from Google Cloud Console
   - **Site URL** — `NEXT_PUBLIC_SITE_URL=http://localhost:3000` (for local development)

3. **Never commit `.env.local`** — it contains secrets. Only commit `.env.local.example` with placeholder values.

For complete documentation and how to obtain each credential, use your project's authentication guide.

## Связанные документы

- Runtime policy should be defined in your project-level architecture decision records.
- Navigation between guidelines is maintained in this directory `README.md`.
