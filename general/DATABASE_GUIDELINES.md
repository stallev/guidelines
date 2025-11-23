# Database & Prisma ORM Guidelines

## Версия документа: 1.0
**Дата создания:** 23.11.2025  
**Проект:** Landing Page + Admin Dashboard  
**Назначение:** Comprehensive руководство по работе с Prisma ORM и PostgreSQL

---

## 📋 О документе

Этот документ описывает best practices для работы с Prisma ORM, PostgreSQL и управления схемой базы данных в проекте.

**Обязательные требования:**
- При создании utilities следовать [`docs/guidelines/react/ai_react_utilities_guidelines.md`](../react/ai_react_utilities_guidelines.md)
- При работе с Server Actions следовать [`SERVER_ACTIONS_GUIDELINES.md`](./SERVER_ACTIONS_GUIDELINES.md)

---

## I. PRISMA CLIENT

### 1.1. Единый экземпляр Prisma Client

```typescript
// ✅ ВСЕГДА используйте единый экземпляр
// lib/db/prisma.ts

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ❌ НИКОГДА не создавайте новые экземпляры
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient(); // НЕ ДЕЛАЙТЕ ТАК!
```

### 1.2. Импорт Prisma Client

```typescript
// ✅ Правильный импорт
import { prisma } from '@/lib/db/prisma';

// Использование
const services = await prisma.service.findMany();

// ❌ Неправильный импорт
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient(); // НЕ ДЕЛАЙТЕ ТАК!
```

### 1.3. Connection Pooling

```env
# .env.local

# DATABASE_URL - для приложения (с connection pooling)
DATABASE_URL="postgresql://postgres.PROJECT_REF:[PASSWORD]@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# DIRECT_URL - для миграций Prisma (прямое соединение)
DIRECT_URL="postgresql://postgres.PROJECT_REF:[PASSWORD]@aws-1-eu-north-1.pooler.supabase.com:5432/postgres"
```

```prisma
// prisma/schema.prisma

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Connection pooling
  directUrl = env("DIRECT_URL")        // Прямое соединение для миграций
}
```

---

## II. CRUD ОПЕРАЦИИ

### 2.1. CREATE

```typescript
// ✅ Создание записи
import { prisma } from '@/lib/db/prisma';

// Простое создание
const service = await prisma.service.create({
  data: {
    name: 'Установка люстры',
    slug: 'ustanovka-lyustry',
    shortDescription: 'Профессиональная установка люстры',
    price: 50.00,
    unit: 'услуга',
    active: true,
    order: 1,
  },
});

// Создание с связями
const order = await prisma.order.create({
  data: {
    orderNumber: 'ORD-20251123-0001',
    clientName: 'Иван Иванов',
    clientPhone: '+375291234567',
    price: 50.00,
    status: 'PENDING',
    service: {
      connect: { id: serviceId }, // Связь с существующей услугой
    },
  },
  include: {
    service: true, // Включить связанную услугу в результат
  },
});

// Создание с вложенными записями
const order = await prisma.order.create({
  data: {
    orderNumber: 'ORD-20251123-0001',
    clientName: 'Иван Иванов',
    clientPhone: '+375291234567',
    price: 50.00,
    status: 'PENDING',
    serviceId: serviceId,
    statusHistory: {
      create: { // Создать вложенную запись
        status: 'PENDING',
        changedBy: userId,
      },
    },
  },
});
```

### 2.2. READ

```typescript
// ✅ Чтение записей

// Найти одну запись
const service = await prisma.service.findUnique({
  where: { id: serviceId },
});

// Найти первую подходящую
const service = await prisma.service.findFirst({
  where: { slug: 'ustanovka-lyustry' },
});

// Найти все записи
const services = await prisma.service.findMany({
  where: { active: true },
  orderBy: { order: 'asc' },
});

// С фильтрацией
const services = await prisma.service.findMany({
  where: {
    AND: [
      { active: true },
      { price: { lte: 100 } }, // Цена <= 100
    ],
  },
});

// С пагинацией
const services = await prisma.service.findMany({
  skip: 0,     // Пропустить первые 0 записей
  take: 10,    // Взять 10 записей
  orderBy: { createdAt: 'desc' },
});

// С включением связей
const order = await prisma.order.findUnique({
  where: { id: orderId },
  include: {
    service: true,
    statusHistory: {
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    },
  },
});

// Select конкретных полей
const services = await prisma.service.findMany({
  select: {
    id: true,
    name: true,
    price: true,
    // остальные поля не будут включены
  },
});
```

### 2.3. UPDATE

```typescript
// ✅ Обновление записей

// Обновить одну запись
const service = await prisma.service.update({
  where: { id: serviceId },
  data: {
    name: 'Новое название',
    price: 75.00,
  },
});

// Обновить несколько записей
const result = await prisma.service.updateMany({
  where: { active: false },
  data: { active: true },
});
console.log(`Updated ${result.count} services`);

// Обновить с условием (increment/decrement)
const service = await prisma.service.update({
  where: { id: serviceId },
  data: {
    order: { increment: 1 }, // Увеличить на 1
  },
});

// Upsert (update или create)
const service = await prisma.service.upsert({
  where: { slug: 'ustanovka-lyustry' },
  update: {
    name: 'Обновленное название',
  },
  create: {
    name: 'Установка люстры',
    slug: 'ustanovka-lyustry',
    shortDescription: 'Профессиональная установка люстры',
    price: 50.00,
    unit: 'услуга',
    active: true,
    order: 1,
  },
});
```

### 2.4. DELETE

```typescript
// ✅ Удаление записей

// Удалить одну запись
const service = await prisma.service.delete({
  where: { id: serviceId },
});

// Удалить несколько записей
const result = await prisma.service.deleteMany({
  where: { active: false },
});
console.log(`Deleted ${result.count} services`);

// Мягкое удаление (soft delete)
// Добавьте поле deletedAt в схему
const service = await prisma.service.update({
  where: { id: serviceId },
  data: {
    deletedAt: new Date(),
  },
});
```

---

## III. ПРОДВИНУТЫЕ ЗАПРОСЫ

### 3.1. Поиск и фильтрация

```typescript
// ✅ Поиск по тексту
const orders = await prisma.order.findMany({
  where: {
    OR: [
      { clientName: { contains: searchQuery, mode: 'insensitive' } },
      { clientPhone: { contains: searchQuery } },
      { orderNumber: { contains: searchQuery } },
    ],
  },
});

// Фильтрация по диапазону
const services = await prisma.service.findMany({
  where: {
    price: {
      gte: 50,  // Greater than or equal
      lte: 100, // Less than or equal
    },
  },
});

// Фильтрация по дате
const orders = await prisma.order.findMany({
  where: {
    createdAt: {
      gte: new Date('2025-01-01'),
      lt: new Date('2025-12-31'),
    },
  },
});

// Комбинированные фильтры
const orders = await prisma.order.findMany({
  where: {
    AND: [
      { status: 'PENDING' },
      {
        OR: [
          { clientName: { contains: 'Иван' } },
          { clientPhone: { contains: '+375' } },
        ],
      },
    ],
  },
});
```

### 3.2. Агрегация

```typescript
// ✅ Подсчет записей
const count = await prisma.service.count({
  where: { active: true },
});

// Aggregate функции
const result = await prisma.order.aggregate({
  _count: { id: true },
  _sum: { price: true },
  _avg: { price: true },
  _min: { price: true },
  _max: { price: true },
  where: { status: 'COMPLETED' },
});

console.log(`Total orders: ${result._count.id}`);
console.log(`Total revenue: ${result._sum.price}`);
console.log(`Average order: ${result._avg.price}`);

// GroupBy
const ordersByStatus = await prisma.order.groupBy({
  by: ['status'],
  _count: { id: true },
  _sum: { price: true },
});

// Результат:
// [
//   { status: 'PENDING', _count: { id: 10 }, _sum: { price: 500 } },
//   { status: 'COMPLETED', _count: { id: 25 }, _sum: { price: 1250 } },
// ]
```

### 3.3. Транзакции

```typescript
// ✅ Interactive transactions
const result = await prisma.$transaction(async (tx) => {
  // 1. Создаем заказ
  const order = await tx.order.create({
    data: {
      orderNumber: 'ORD-20251123-0001',
      clientName: 'Иван Иванов',
      clientPhone: '+375291234567',
      serviceId: serviceId,
      price: 50.00,
      status: 'PENDING',
    },
  });

  // 2. Создаем запись в истории статусов
  await tx.orderStatusHistory.create({
    data: {
      orderId: order.id,
      status: 'PENDING',
      changedBy: userId,
    },
  });

  // 3. Обновляем счетчик заказов услуги
  await tx.service.update({
    where: { id: serviceId },
    data: {
      ordersCount: { increment: 1 },
    },
  });

  return order;
});

// Sequential operations (простая транзакция)
const [deletedOrders, deletedHistory] = await prisma.$transaction([
  prisma.order.deleteMany({ where: { status: 'CANCELLED' } }),
  prisma.orderStatusHistory.deleteMany({ where: { /* ... */ } }),
]);
```

### 3.4. Raw SQL

```typescript
// ✅ Raw SQL запросы (когда Prisma недостаточно)

// Raw query
const services = await prisma.$queryRaw`
  SELECT * FROM services
  WHERE active = true
  AND price BETWEEN 50 AND 100
  ORDER BY "order" ASC
`;

// Raw execute (для INSERT, UPDATE, DELETE)
const result = await prisma.$executeRaw`
  UPDATE services
  SET active = false
  WHERE "createdAt" < NOW() - INTERVAL '1 year'
`;

// Tagged template с параметрами
const minPrice = 50;
const maxPrice = 100;
const services = await prisma.$queryRaw`
  SELECT * FROM services
  WHERE price BETWEEN ${minPrice} AND ${maxPrice}
`;
```

---

## IV. RELATIONS (СВЯЗИ)

### 4.1. Типы связей

```prisma
// prisma/schema.prisma

// One-to-Many (Один ко многим)
model Service {
  id     String  @id @default(cuid())
  name   String
  orders Order[] // Одна услуга - много заказов
}

model Order {
  id        String  @id @default(cuid())
  serviceId String
  service   Service @relation(fields: [serviceId], references: [id])
}

// One-to-One (Один к одному)
model Order {
  id     String  @id @default(cuid())
  review Review? // Один заказ - один отзыв (опционально)
}

model Review {
  id      String @id @default(cuid())
  orderId String @unique
  order   Order  @relation(fields: [orderId], references: [id])
}

// Many-to-Many (Многие ко многим)
// Через явную промежуточную таблицу
model Service {
  id         String               @id @default(cuid())
  categories ServiceOnCategory[]
}

model Category {
  id       String               @id @default(cuid())
  services ServiceOnCategory[]
}

model ServiceOnCategory {
  serviceId  String
  categoryId String
  service    Service  @relation(fields: [serviceId], references: [id])
  category   Category @relation(fields: [categoryId], references: [id])

  @@id([serviceId, categoryId])
}
```

### 4.2. Работа со связями

```typescript
// ✅ Include связанных записей
const order = await prisma.order.findUnique({
  where: { id: orderId },
  include: {
    service: true,           // Включить услугу
    statusHistory: true,     // Включить историю статусов
    review: true,            // Включить отзыв (если есть)
  },
});

// Select с вложенными связями
const order = await prisma.order.findUnique({
  where: { id: orderId },
  select: {
    id: true,
    orderNumber: true,
    service: {
      select: {
        name: true,
        price: true,
      },
    },
    statusHistory: {
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        status: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    },
  },
});

// Создание с связями
const order = await prisma.order.create({
  data: {
    orderNumber: 'ORD-20251123-0001',
    clientName: 'Иван Иванов',
    clientPhone: '+375291234567',
    price: 50.00,
    status: 'PENDING',
    service: {
      connect: { id: serviceId }, // Связать с существующей услугой
    },
    statusHistory: {
      create: {                   // Создать новую запись истории
        status: 'PENDING',
        changedBy: userId,
      },
    },
  },
});
```

---

## V. ТИПЫ ДАННЫХ PRISMA

### 5.1. Базовые типы

```prisma
model Example {
  // Строки
  id       String  @id @default(cuid())
  name     String
  email    String? // Optional string

  // Числа
  age      Int
  views    BigInt
  price    Decimal @db.Decimal(10, 2)
  rating   Float

  // Булево
  active   Boolean @default(true)

  // Даты
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  birthDate DateTime?

  // JSON
  metadata Json?

  // Enum
  role     Role    @default(CLIENT)
}

enum Role {
  CLIENT
  ADMIN
}
```

### 5.2. Decimal тип (для цен)

```typescript
// ✅ Работа с Decimal типом
import { Decimal } from '@prisma/client/runtime/library';

// Создание
const service = await prisma.service.create({
  data: {
    name: 'Установка люстры',
    price: new Decimal('50.00'), // Используйте строку для точности
  },
});

// Математические операции
const price = service.price;
const priceWithTax = price.mul(1.20); // Умножить на 1.20
const roundedPrice = price.toDecimalPlaces(2); // Округлить до 2 знаков

// Конвертация
const priceString = service.price.toString(); // "50.00"
const priceNumber = service.price.toNumber(); // 50.00

// Сравнение
if (service.price.greaterThan(100)) {
  // Цена больше 100
}

// ⚠️ Сериализация для Client Components
// Decimal не может быть передан в Client Component напрямую
function serializeService(service) {
  return {
    ...service,
    price: service.price.toString(), // Конвертируем в строку
  };
}
```

### 5.3. DateTime тип

```typescript
// ✅ Работа с DateTime
import { prisma } from '@/lib/db/prisma';

// Создание с текущей датой
const order = await prisma.order.create({
  data: {
    // ...
    createdAt: new Date(),           // Текущая дата
    completedAt: new Date('2025-12-31'),
  },
});

// Фильтрация по дате
const orders = await prisma.order.findMany({
  where: {
    createdAt: {
      gte: new Date('2025-01-01'),   // >= 1 января 2025
      lt: new Date('2025-12-31'),    // < 31 декабря 2025
    },
  },
});

// ⚠️ Сериализация для Client Components
function serializeOrder(order) {
  return {
    ...order,
    createdAt: order.createdAt.toISOString(), // ISO 8601 string
    updatedAt: order.updatedAt.toISOString(),
  };
}
```

---

## VI. МИГРАЦИИ

### 6.1. Создание миграций

```bash
# Создать миграцию после изменения schema.prisma
npx prisma migrate dev --name add_gallery_table

# Применить миграции
npx prisma migrate deploy

# Сбросить базу данных (⚠️ удалит все данные!)
npx prisma migrate reset
```

### 6.2. Структура миграций

```sql
-- prisma/migrations/20251123123456_add_gallery_table/migration.sql

-- CreateTable
CREATE TABLE "gallery_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gallery_items_isActive_idx" ON "gallery_items"("isActive");
CREATE INDEX "gallery_items_order_idx" ON "gallery_items"("order");
```

### 6.3. Best practices для миграций

```prisma
// ✅ Правильно - добавляем новое поле с default значением
model Service {
  id          String   @id @default(cuid())
  name        String
  description String   @default("") // Default для существующих записей
}

// ❌ Неправильно - добавляем required поле без default
model Service {
  id          String   @id @default(cuid())
  name        String
  description String   // Ошибка! Как заполнить для существующих записей?
}

// ✅ Правильно - добавляем optional поле
model Service {
  id          String   @id @default(cuid())
  name        String
  description String?  // Optional, можно добавить безопасно
}
```

---

## VII. ИНДЕКСЫ И ОПТИМИЗАЦИЯ

### 7.1. Индексы в Prisma

```prisma
model Service {
  id    String  @id @default(cuid())
  slug  String  @unique              // Уникальный индекс
  name  String
  active Boolean @default(true)
  order  Int     @default(0)
  createdAt DateTime @default(now())

  // Простые индексы
  @@index([slug])                    // Индекс по slug
  @@index([active])                  // Индекс по active
  @@index([order])                   // Индекс по order
  
  // Составной индекс
  @@index([active, order])           // Индекс по active и order
  
  // Индекс с сортировкой
  @@index([createdAt(sort: Desc)])   // Индекс с DESC сортировкой
  
  // Полнотекстовый поиск (PostgreSQL)
  @@index([name], type: Gin)         // GIN индекс для текстового поиска

  @@map("services")
}

model Order {
  id          String      @id @default(cuid())
  orderNumber String      @unique
  status      OrderStatus
  createdAt   DateTime    @default(now())

  @@index([orderNumber])
  @@index([status])
  @@index([createdAt(sort: Desc)])
  
  @@map("orders")
}
```

### 7.2. Оптимизация запросов

```typescript
// ✅ Select только нужные поля
const services = await prisma.service.findMany({
  select: {
    id: true,
    name: true,
    price: true,
    // Не загружаем fullDescription, image и др.
  },
});

// ✅ Используйте пагинацию
const services = await prisma.service.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' },
});

// ✅ Используйте cursor-based pagination для больших датасетов
const services = await prisma.service.findMany({
  take: 10,
  cursor: lastService ? { id: lastService.id } : undefined,
  orderBy: { id: 'asc' },
});

// ❌ Избегайте N+1 проблемы
// Неправильно:
const orders = await prisma.order.findMany();
for (const order of orders) {
  const service = await prisma.service.findUnique({ 
    where: { id: order.serviceId } 
  }); // N+1 запросов!
}

// ✅ Правильно - используйте include
const orders = await prisma.order.findMany({
  include: {
    service: true, // Один запрос с JOIN
  },
});
```

---

## VIII. SEED DATA

### 8.1. Структура seed скрипта

```typescript
// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Создаем админа
  const adminPassword = await bcrypt.hash('admin12345', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@electrician.local' },
    update: {},
    create: {
      name: 'Администратор',
      email: 'admin@electrician.local',
      phone: '+375291234567',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`Created admin: ${admin.email}`);

  // 2. Создаем услуги
  const services = [
    {
      name: 'Установка люстры',
      slug: 'ustanovka-lyustry',
      shortDescription: 'Профессиональная установка люстры любой сложности',
      price: 50.00,
      unit: 'услуга',
      order: 1,
      active: true,
    },
    // ... другие услуги
  ];

  for (const serviceData of services) {
    const service = await prisma.service.upsert({
      where: { slug: serviceData.slug },
      update: {},
      create: serviceData,
    });
    console.log(`Created service: ${service.name}`);
  }

  // 3. Создаем настройки
  const settings = await prisma.setting.upsert({
    where: { key: 'site_config' },
    update: {},
    create: {
      key: 'site_config',
      value: {
        siteName: 'Электрик в Могилёве',
        siteDescription: 'Профессиональные электромонтажные работы',
        phone: '+375291234567',
        email: 'info@electrician.by',
      },
    },
  });
  console.log('Created settings');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 8.2. Запуск seed

```bash
# Запустить seed
npx prisma db seed

# Или через npm script
npm run seed
```

```json
// package.json

{
  "scripts": {
    "seed": "tsx prisma/seed.ts"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

## IX. PRISMA STUDIO

### 9.1. Запуск Prisma Studio

```bash
# Запустить Prisma Studio (GUI для БД)
npx prisma studio

# Или через npm script
npm run studio
```

### 9.2. Использование Prisma Studio

- **Просмотр данных**: Открывайте таблицы и просматривайте записи
- **Редактирование**: Изменяйте записи напрямую через GUI
- **Фильтрация**: Фильтруйте данные по полям
- **Поиск**: Ищите записи по значениям
- **Удаление**: Удаляйте записи (⚠️ будьте осторожны!)

---

## X. CHECKLIST

### 10.1. Checklist для работы с Prisma

- [ ] **Prisma Client**
  - [ ] Используется единый экземпляр из `@/lib/db/prisma`
  - [ ] Правильная конфигурация DATABASE_URL и DIRECT_URL

- [ ] **Схема БД**
  - [ ] Правильные типы данных (Decimal для цен)
  - [ ] Индексы на часто запрашиваемых полях
  - [ ] Правильные relations
  - [ ] @@map для имен таблиц

- [ ] **CRUD операции**
  - [ ] Используются типизированные запросы
  - [ ] Include/select для оптимизации
  - [ ] Транзакции где необходимо
  - [ ] Error handling

- [ ] **Типы данных**
  - [ ] Decimal для денежных сумм
  - [ ] DateTime для дат
  - [ ] Правильная сериализация для Client Components

- [ ] **Миграции**
  - [ ] Миграции созданы после изменения схемы
  - [ ] Применены на всех окружениях
  - [ ] Default значения для новых полей

- [ ] **Оптимизация**
  - [ ] Индексы на часто запрашиваемых полях
  - [ ] Пагинация для больших списков
  - [ ] Select только нужных полей
  - [ ] Избегание N+1 проблемы

---

## XI. СВЯЗАННЫЕ ДОКУМЕНТЫ

- [`SERVER_ACTIONS_GUIDELINES.md`](./SERVER_ACTIONS_GUIDELINES.md) - Работа с Server Actions
- [`docs/guidelines/react/ai_react_utilities_guidelines.md`](../react/ai_react_utilities_guidelines.md) - Utility функции
- [`docs/prds/ARCHITECTURE.md`](../../prds/ARCHITECTURE.md) - Архитектура проекта
- [Prisma Documentation](https://www.prisma.io/docs/) - Официальная документация

---

**Версия документа:** 1.0  
**Последнее обновление:** 23.11.2025  
**Статус:** ✅ Актуально

