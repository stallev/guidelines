# Zustand State Management in Next.js — AI Agent Guideline

> **Цель документа**: Определить принципы и паттерны для эффективного управления глобальным состоянием в Next.js приложениях с использованием Zustand. Следование этим рекомендациям критически важно для производительности приложения.

---

## 1. Архитектура Store

### 1.1 Структура директорий

```
src/
├── store/
│   ├── store.ts              # Главный store (объединяет slices)
│   ├── create[Feature]Slice.ts  # Отдельный slice для каждой feature
│   └── ...
├── providers/
│   └── store-provider.tsx    # React Context Provider для store
├── hooks/
│   └── useStore.ts           # Кастомный хук для hydration-safe доступа
```

### 1.2 Slice-based архитектура (ОБЯЗАТЕЛЬНО)

**Каждая feature-область должна иметь свой slice.** Это обеспечивает:
- Модульность и переиспользуемость
- Изолированное тестирование
- Четкое разделение ответственности

```typescript
// src/store/createFeatureSlice.ts
import { StateCreator } from "zustand";

export interface FeatureSlice {
    // Состояние
    data: DataType[];
    loading: boolean;
    error: string | null;
    // Actions
    fetchData: () => Promise<void>;
    resetData: () => void;
}

export const createFeatureSlice: StateCreator<FeatureSlice> = (set) => ({
    data: [],
    loading: false,
    error: null,
    fetchData: async () => {
        set({ loading: true, error: null });
        try {
            const data = await apiCall();
            set({ data, loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },
    resetData: () => set({ data: [], error: null }),
});
```

### 1.3 Объединение Slices в главном Store

```typescript
// src/store/store.ts
import { createStore } from 'zustand/vanilla'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'

export type AppState = FeatureSlice & AnotherSlice & ...

export const createAppStore = (initState: Partial<AppState> = {}) => {
    return createStore<AppState>()(
        devtools(
            persist(
                (...a) => ({
                    ...createFeatureSlice(...a),
                    ...createAnotherSlice(...a),
                    ...initState,
                }),
                {
                    name: 'app-store',
                    storage: createJSONStorage(() => {
                        // SSR-safe storage
                        if (typeof window !== 'undefined') {
                            return window.localStorage
                        }
                        return {
                            getItem: () => null,
                            setItem: () => {},
                            removeItem: () => {},
                        }
                    }),
                }
            )
        )
    )
}
```

---

## 2. Интеграция с Next.js (App Router)

### 2.1 Store Provider (КРИТИЧЕСКИ ВАЖНО)

Используй `createStore` из `zustand/vanilla` + React Context для корректной работы с SSR:

```tsx
// src/providers/store-provider.tsx
'use client'

import { type ReactNode, createContext, useRef, useContext } from 'react'
import { type AppState, createAppStore } from '@/store/store'
import { useStore } from '@/hooks/useStore'

export type AppStoreApi = ReturnType<typeof createAppStore>

export const AppStoreContext = createContext<AppStoreApi | undefined>(undefined)

export const AppStoreProvider = ({ children }: { children: ReactNode }) => {
    const storeRef = useRef<AppStoreApi>(undefined)
    if (!storeRef.current) {
        storeRef.current = createAppStore()
    }
    return (
        <AppStoreContext.Provider value={storeRef.current}>
            {children}
        </AppStoreContext.Provider>
    )
}

export const useAppStore = <T,>(selector: (store: AppState) => T): T | undefined => {
    const appStoreContext = useContext(AppStoreContext)
    if (!appStoreContext) {
        throw new Error('useAppStore must be used within AppStoreProvider')
    }
    return useStore(appStoreContext, selector)
}
```

### 2.2 Hydration-safe хук

**Проблема**: При SSR состояние на сервере и клиенте может отличаться (hydration mismatch).

**Решение**: Кастомный хук, который возвращает `undefined` до завершения hydration:

```typescript
// src/hooks/useStore.ts
import { useState, useEffect } from 'react'
import { useStore as useZustandStore } from 'zustand'

export const useStore = <T, F>(
    store: any,
    callback: (state: T) => F
) => {
    const result = useZustandStore(store, callback as any) as F
    const [data, setData] = useState<F>()

    useEffect(() => {
        setData(result)
    }, [result])

    return data
}
```

### 2.3 Подключение в Layout

```tsx
// src/app/layout.tsx
import { AppStoreProvider } from "@/providers/store-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <AppStoreProvider>
                    {children}
                </AppStoreProvider>
            </body>
        </html>
    );
}
```

---

## 3. Оптимизация производительности

### 3.1 Селекторы — КЛЮЧ К ПРОИЗВОДИТЕЛЬНОСТИ

> [!CAUTION]
> **НИКОГДА не подписывайся на весь store целиком!** Это вызовет ререндер компонента при ЛЮБОМ изменении состояния.

```typescript
// ❌ ПЛОХО — ререндер при любом изменении
const state = useAppStore((state) => state)

// ✅ ХОРОШО — ререндер только при изменении posts
const posts = useAppStore((state) => state.posts)
```

### 3.2 useShallow для объектов (ОБЯЗАТЕЛЬНО)

При выборке нескольких значений используй `useShallow`:

```tsx
import { useShallow } from 'zustand/react/shallow'

// ✅ ПРАВИЛЬНО — с useShallow
const { posts, loading, error } = useAppStore(
    useShallow((state) => ({
        posts: state.posts,
        loading: state.loading,
        error: state.error,
    }))
) ?? {}

// ❌ НЕПРАВИЛЬНО — без useShallow будет ререндер на каждое изменение
const data = useAppStore((state) => ({
    posts: state.posts,
    loading: state.loading,
}))
```

### 3.3 Обработка undefined состояния

Из-за hydration хук может возвращать `undefined`. **Всегда обрабатывай этот случай**:

```tsx
export default function Component() {
    const state = useAppStore(useShallow((s) => ({
        data: s.data,
        action: s.action,
    })))

    // Guard clause для hydration
    if (!state) return <div>Loading...</div>

    const { data, action } = state
    return <div>{/* ... */}</div>
}
```

### 3.4 Атомарные обновления состояния

```typescript
// ✅ Обновляй только необходимые поля
set({ loading: true, error: null })

// ✅ Используй функцию для доступа к предыдущему состоянию
set((state) => ({ count: state.count + 1 }))

// ❌ Избегай spread всего состояния без необходимости
set((state) => ({ ...state, loading: true })) // Zustand делает merge автоматически
```

---

## 4. Middleware

### 4.1 persist — Персистентность состояния

```typescript
persist(
    storeCreator,
    {
        name: 'storage-key',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
            // Сохраняй только необходимые данные
            favorites: state.favorites,
            // НЕ сохраняй временные данные
            // loading: state.loading, ❌
        }),
    }
)
```

### 4.2 devtools — Отладка

```typescript
devtools(
    storeCreator,
    { name: 'AppStore', enabled: process.env.NODE_ENV === 'development' }
)
```

### 4.3 Порядок middleware

```typescript
// Правильный порядок: devtools оборачивает persist
createStore<AppState>()(
    devtools(
        persist(
            storeCreator,
            persistConfig
        )
    )
)
```

---

## 5. Паттерны и Best Practices

### 5.1 Асинхронные Actions

```typescript
fetchData: async () => {
    set({ loading: true, error: null, lastUpdated: new Date() });
    try {
        const data = await api.fetchData();
        set({ data, loading: false });
    } catch (error) {
        set({ error: (error as Error).message, loading: false });
    }
},
```

### 5.2 Типизация StateCreator

```typescript
import { StateCreator } from "zustand";

// Для изолированного slice
export const createSlice: StateCreator<SliceType> = (set) => ({...})

// Для slice с доступом к другим slices
export const createSlice: StateCreator<
    AppState,  // Полный тип state
    [],
    [],
    SliceType  // Тип этого slice
> = (set, get) => ({...})
```

### 5.3 Доступ к состоянию других slices

```typescript
const createSliceWithDeps: StateCreator<AppState, [], [], MySlice> = (set, get) => ({
    action: () => {
        const otherSliceData = get().otherSliceProperty;
        // ...
    }
})
```

---

## 6. Чеклист для Code Review

| Проверка | Критичность |
|----------|-------------|
| Используется `useShallow` при выборке объектов | 🔴 Критично |
| Селекторы выбирают минимум данных | 🔴 Критично |
| Обработан `undefined` при hydration | 🔴 Критично |
| Store создается через `createStore` из `zustand/vanilla` | 🔴 Критично |
| Slice имеет интерфейс с типами | 🟡 Важно |
| persist.partialize исключает временные данные | 🟡 Важно |
| Actions обрабатывают ошибки | 🟡 Важно |
| Компоненты используют `'use client'` директиву | 🟢 Стандарт |

---

## 7. Антипаттерны

```typescript
// ❌ Подписка на весь store
const store = useAppStore((s) => s)

// ❌ Создание объекта в селекторе без useShallow
const data = useAppStore((s) => ({ a: s.a, b: s.b }))

// ❌ Хранение производных данных в store
// Вместо этого вычисляй в компоненте или useMemo

// ❌ Использование create() вместо createStore() для SSR
import { create } from 'zustand' // для client-side only

// ❌ Прямой доступ к localStorage без проверки typeof window
storage: localStorage // Ошибка на сервере
```

---

## 8. Краткая справка

| Задача | Решение |
|--------|---------|
| Создать store для Next.js SSR | `createStore` из `zustand/vanilla` + Context |
| Избежать hydration mismatch | Кастомный `useStore` хук с `useState`/`useEffect` |
| Предотвратить лишние ререндеры | Атомарные селекторы + `useShallow` |
| Персистентность | `persist` middleware + `createJSONStorage` |
| Отладка | `devtools` middleware |
| Модульность | Slice-pattern с `StateCreator` |
