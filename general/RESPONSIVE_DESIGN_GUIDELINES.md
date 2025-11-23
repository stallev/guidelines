# Responsive Design Guidelines

## Версия документа: 1.0
**Дата создания:** 23.11.2025

---

## 📋 О документе

Best practices для создания адаптивного дизайна с Tailwind CSS.

**Обязательные требования:**
- Для таблиц следовать [`docs/guidelines/react/ai_responsive_table_guidelines.md`](../react/ai_responsive_table_guidelines.md)

---

## I. BREAKPOINTS

```typescript
// Tailwind CSS breakpoints
// sm: 640px   - Телефоны в landscape
// md: 768px   - Планшеты
// lg: 1024px  - Ноутбуки
// xl: 1280px  - Десктопы
// 2xl: 1536px - Большие экраны

// ✅ Mobile-first подход
<div className="
  w-full         // Mobile: 100%
  md:w-1/2       // Tablet: 50%
  lg:w-1/3       // Desktop: 33%
  p-4            // Mobile: padding 16px
  md:p-6         // Tablet: padding 24px
">
  Content
</div>
```

---

## II. АДАПТИВНЫЕ КОМПОНЕНТЫ

```typescript
// ✅ Desktop/Mobile views
export const Component = () => {
  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block">
        <DesktopTable />
      </div>
      
      {/* Mobile */}
      <div className="block lg:hidden">
        <MobileCards />
      </div>
    </>
  );
};
```

---

## III. АДАПТИВНАЯ ТИПОГРАФИКА

```typescript
<h1 className="
  text-2xl       // Mobile: 24px
  md:text-3xl    // Tablet: 30px
  lg:text-4xl    // Desktop: 36px
  font-bold
">
  Heading
</h1>
```

---

## IV. CHECKLIST

- [ ] Mobile-first подход
- [ ] Breakpoints: sm (640), md (768), lg (1024), xl (1280)
- [ ] Адаптивные изображения
- [ ] Адаптивная типографика
- [ ] Touch-friendly (min 44x44px для кнопок)

---

**Версия:** 1.0 | **Статус:** ✅ Актуально

