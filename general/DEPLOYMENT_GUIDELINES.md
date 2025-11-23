# Deployment Guidelines

## Версия документа: 1.0
**Дата создания:** 23.11.2025

---

## 📋 О документе

Руководство по деплою Next.js приложения на Vercel.

---

## I. VERCEL SETUP

```bash
# Установить Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

---

## II. ENVIRONMENT VARIABLES

```env
# Production environment variables (Vercel Dashboard)
DATABASE_URL=
DIRECT_URL=
AUTH_SECRET=
NEXTAUTH_URL=https://your-domain.com
SUPABASE_STORAGE_ACCESS_KEY=
SUPABASE_STORAGE_SECRET_KEY=
```

---

## III. BUILD CONFIGURATION

```json
// package.json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

---

## IV. PRISMA MIGRATIONS

```bash
# Apply migrations on Vercel
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

---

## V. CHECKLIST

- [ ] **Vercel**
  - [ ] Проект создан в Vercel
  - [ ] GitHub integration настроен
  - [ ] Environment variables установлены
  - [ ] Custom domain настроен

- [ ] **Database**
  - [ ] Миграции применены
  - [ ] Prisma Client сгенерирован
  - [ ] Connection pooling настроен

- [ ] **Build**
  - [ ] `npm run build` проходит успешно
  - [ ] Нет TypeScript errors
  - [ ] Нет ESLint warnings

- [ ] **Post-deployment**
  - [ ] Сайт доступен по URL
  - [ ] Все страницы работают
  - [ ] Аутентификация работает
  - [ ] База данных доступна

---

**Версия:** 1.0 | **Статус:** ✅ Актуально

