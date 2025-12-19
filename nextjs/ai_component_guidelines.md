# Universal React Components Guidelines

This document provides comprehensive guidelines for creating React components that are framework-agnostic and can be used across different React-based frameworks (Next.js, Astro, Remix, etc.). These guidelines focus on universal React patterns and best practices.

---

## 1. 🏗️ Architectural Foundations

### 1.1. Component Hierarchy Principles
Components should follow a clear hierarchy based on complexity and reusability:

```
Pages/Views → Layouts → Organisms → Molecules → Atoms
```

| Level | Purpose | Characteristics | Examples |
|-------|---------|-----------------|----------|
| **Atoms** | Basic UI elements | Single responsibility, highly reusable | `Button`, `Input`, `Icon` |
| **Molecules** | Simple component groups | 2-3 atoms working together | `SearchField`, `UserAvatar` |
| **Organisms** | Complex UI sections | Multiple molecules/atoms | `Header`, `ProductCard`, `Form` |
| **Layouts** | Page structure | Containers and grid systems | `MainLayout`, `AuthLayout` |
| **Pages/Views** | Complete pages | Composition of organisms | `HomePage`, `UserProfile` |

### 1.2. Component Design Principles
- **Single Responsibility**: Each component should have one clear purpose
- **Composition over Inheritance**: Build complex components by combining simpler ones
- **Props Interface**: All components must have explicit TypeScript interfaces
- **Reusability**: Components should be designed for reuse across different contexts
- **Accessibility**: Components should follow WCAG guidelines
- **Explicit Typing**: Use explicit parameter typing `(props: PropsType)` instead of `React.FC<PropsType>` for better type inference and flexibility
- **Arrow Functions**: ⚠️ **MANDATORY REQUIREMENT**: All React components MUST be defined as arrow functions (`const ComponentName = (props: PropsType) => {...}`), NOT as regular functions (`function ComponentName() {...}`). This rule applies to all components: Server Components, Client Components, pages, layouts, and any other React components. Exception: Server Actions and utility functions may use regular functions.

### 1.3. Bundle Optimization Requirements
- **Следуйте документу [`ai_bundle_optimize_nextjs_guideline.md`](./ai_bundle_optimize_nextjs_guideline.md).** Любой компонент должен проверяться на влияние на client bundle.
- **Сервер по умолчанию**: реализуйте компонент как Server Component и выносите в клиентский модуль только строго необходимую интерактивную часть.
- **Динамические импорты**: тяжёлые библиотеки/виджеты подключаем через `next/dynamic` непосредственно в местах использования.
- **Серверная подготовка данных**: форматирование строк, объединение текстов, вычисления выполнять до попадания данных на клиент.
- **Обязательная проверка**: перед ревью запускать `npm run build` и фиксировать рост bundle, если он происходит.

### 1.4. Why Not React.FC?

We avoid using `React.FC<PropsType>` in favor of explicit parameter typing for several reasons:

1. **Better Type Inference**: Explicit typing provides better type inference and IntelliSense support
2. **Generic Support**: Works seamlessly with generic components, which `React.FC` struggles with
3. **Flexibility**: Allows explicit return type annotations when needed (e.g., `JSX.Element | null`)
4. **No Implicit Children**: In React 18+, `React.FC` no longer adds implicit `children`, but explicit typing is clearer
5. **Default Props**: Works better with default parameter values and `defaultProps`
6. **Modern Best Practice**: Aligns with current React and TypeScript community recommendations (2024-2025)

**Recommended Pattern:**
```typescript
interface ComponentProps {
  // props definition
}

export const Component = ({ prop1, prop2 }: ComponentProps) => {
  // component implementation
};
```

**Avoid:**
```typescript
export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // component implementation
};
```

---

## 2. 🧩 Component Structure and Patterns

### 2.1. Component File Structure
```
components/
├── atoms/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   └── Input/
├── molecules/
├── organisms/
└── layouts/
```

### 2.2. Component Template
```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
}

/**
 * Universal Button component
 * @description Button with support for various variants and sizes
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
  className,
  'aria-label': ariaLabel,
  ...props
}: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };
  
  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8 text-lg',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
```

---

## 3. 🎨 Styling and Theming

### 3.1. CSS-in-JS or Utility-First Approach
Choose one consistent approach:

**Option A: CSS Modules**
```typescript
import styles from './Button.module.css';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

/**
 * Button with CSS Modules
 */
export const Button = ({ className, ...props }: ButtonProps) => (
  <button className={cn(styles.button, className)} {...props} />
);
```

**Option B: Utility Classes (Tailwind CSS)**
```typescript
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

/**
 * Button with Tailwind CSS
 */
export const Button = ({ className, ...props }: ButtonProps) => (
  <button className={cn('px-4 py-2 rounded-md', className)} {...props} />
);
```

**Option C: Styled Components**
```typescript
import styled from 'styled-components';

const StyledButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  /* ... */
`;
```

### 3.2. Theme Support
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

---

## 4. 🔧 Component Patterns

### 4.1. Compound Components
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Base Card component
 */
const Card = ({ children, className }: CardProps) => (
  <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}>
    {children}
  </div>
);

/**
 * Card header component
 */
const CardHeader = ({ children, className }: CardHeaderProps) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)}>
    {children}
  </div>
);

/**
 * Card content component
 */
const CardContent = ({ children, className }: CardContentProps) => (
  <div className={cn('p-6 pt-0', className)}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Content = CardContent;

export { Card };
```

### 4.2. Render Props Pattern
```typescript
interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, loading: boolean, error: Error | null) => React.ReactNode;
}

/**
 * Component for data fetching with render props pattern
 * @template T - Type of data being fetched
 */
export const DataFetcher = <T,>({ url, children }: DataFetcherProps<T>): JSX.Element => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return <>{children(data, loading, error)}</>;
};
```

### 4.3. Higher-Order Components (HOCs)
```typescript
interface WithLoadingProps {
  isLoading: boolean;
}

/**
 * HOC for adding loading state to a component
 * @template P - Type of props for the wrapped component
 */
export const withLoading = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WithLoadingComponent = (props: P & WithLoadingProps): JSX.Element => {
    const { isLoading, ...restProps } = props;
    
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    return <Component {...(restProps as P)} />;
  };
  
  return WithLoadingComponent;
};
```

---

## 5. 🛡️ Error Handling and Boundaries

### 5.1. Error Boundary Component
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent 
          error={this.state.error!} 
          resetError={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Default component for displaying errors
 */
const DefaultErrorFallback = ({ 
  error, 
  resetError 
}: DefaultErrorFallbackProps) => (
  <div className="p-4 border border-red-200 rounded-md bg-red-50">
    <h2 className="text-lg font-semibold text-red-800">Something went wrong</h2>
    <p className="text-red-600">{error.message}</p>
    <button 
      onClick={resetError}
      className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
    >
      Try again
    </button>
  </div>
);
```

---

## 6. ♿ Accessibility Guidelines

### 6.1. ARIA Attributes
```typescript
interface AccessibleButtonProps {
  children: React.ReactNode;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  role?: string;
}

/**
 * Accessible button with full ARIA attributes support
 */
export const AccessibleButton = ({
  children,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-expanded': ariaExpanded,
  'aria-pressed': ariaPressed,
  role,
  ...props
}: AccessibleButtonProps) => (
  <button
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedBy}
    aria-expanded={ariaExpanded}
    aria-pressed={ariaPressed}
    role={role}
    {...props}
  >
    {children}
  </button>
);
```

### 6.2. Focus Management
```typescript
/**
 * Hook for managing focus within a container (focus trap)
 * @param isActive - Whether to activate the focus trap
 * @returns Ref for the container
 */
export const useFocusTrap = (isActive: boolean): React.RefObject<HTMLElement> => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    firstElement?.focus();
    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
};
```

---

## 8. 📦 Component Export Patterns

### 8.1. Barrel Exports
```typescript
// components/atoms/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { Icon } from './Icon';

// components/index.ts
export * from './atoms';
export * from './molecules';
export * from './organisms';
export * from './layouts';
```

### 8.2. Named vs Default Exports
```typescript
// Prefer named exports for better tree-shaking
export const Button = () => { /* ... */ };

// Use default export only for main component of a file
const Modal = () => { /* ... */ };
export default Modal;
```

---

## 9. ⚡ React Compiler (Next.js 16+)

### 9.1. React Compiler Overview

**⚠️ IMPORTANT**: If `reactCompiler: true` is enabled in `next.config.ts`, React Compiler automatically optimizes components. This means many manual optimizations become redundant.

**What React Compiler does:**
- Automatically memoizes components (equivalent to `memo`)
- Automatically memoizes values (equivalent to `useMemo`)
- Automatically memoizes functions (equivalent to `useCallback`)
- Optimizes re-renders based on actual dependencies

**When React Compiler is active:**
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  reactCompiler: true, // ← React Compiler enabled
  // ...
};
```

### 9.2. Code Writing Rules for React Compiler

#### ✅ Recommended Patterns:

1. **Pure components** - components should be pure functions:
```typescript
// ✅ GOOD: Pure function
export const Button = ({ onClick, children }: ButtonProps) => {
  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
};

// ❌ BAD: Props mutation
export const Button = ({ onClick, children }: ButtonProps) => {
  onClick.mutated = true; // Mutation!
  return <button onClick={onClick}>{children}</button>;
};
```

2. **Stable dependencies** - use stable references:
```typescript
// ✅ GOOD: Stable reference
const handleClick = () => {
  console.log('clicked');
};

// ✅ GOOD: useCallback not needed with React Compiler
export const Button = ({ onClick }: ButtonProps) => {
  const handleClick = () => {
    onClick?.();
  };
  return <button onClick={handleClick}>Click</button>;
};
```

3. **Proper useEffect usage**:
```typescript
// ✅ GOOD: Explicit dependencies
export const Component = ({ userId }: ComponentProps) => {
  useEffect(() => {
    fetchUser(userId);
  }, [userId]); // Explicit dependencies
  
  return <div>...</div>;
};
```

#### ❌ Patterns to Avoid:

1. **Redundant memoizations** - React Compiler does this automatically:
```typescript
// ❌ REDUNDANT with React Compiler:
export const Component = memo(({ data }: ComponentProps) => {
  const processed = useMemo(() => processData(data), [data]);
  const handleClick = useCallback(() => {
    // ...
  }, []);
  
  return <div>...</div>;
});

// ✅ CORRECT with React Compiler:
export const Component = ({ data }: ComponentProps) => {
  const processed = processData(data); // Compiler optimizes automatically
  const handleClick = () => {
    // ...
  };
  
  return <div>...</div>;
};
```

2. **Object and array mutations**:
```typescript
// ❌ BAD: Mutation
const updateData = (data: Data[]) => {
  data.push(newItem); // Mutation!
};

// ✅ GOOD: Immutable update
const updateData = (data: Data[]) => {
  return [...data, newItem]; // New array
};
```

3. **Unstable references in dependencies**:
```typescript
// ❌ BAD: Unstable reference
useEffect(() => {
  // ...
}, [{ id: 1 }]); // New object on every render!

// ✅ GOOD: Primitive values or stable references
useEffect(() => {
  // ...
}, [userId]); // Primitive value
```

### 9.3. When Manual Optimizations Are Still Needed

React Compiler doesn't replace all optimizations. Manual optimizations are still needed for:

1. **Heavy computations** - if computation is very expensive, you can keep `useMemo`:
```typescript
// If computation is VERY heavy (e.g., processing large arrays)
const expensiveResult = useMemo(() => {
  return heavyComputation(data);
}, [data]);
```

2. **Third-party libraries** - if library requires stable references:
```typescript
// If library requires stable reference
const stableCallback = useCallback(() => {
  libraryFunction();
}, []);
```

3. **Refs for DOM elements** - `useRef` is still needed:
```typescript
const inputRef = useRef<HTMLInputElement>(null);
```

### 9.4. Migrating Existing Code

When enabling React Compiler:

1. **Remove redundant `memo`**:
```typescript
// Before:
export const Component = memo(({ data }: ComponentProps) => { ... });

// After:
export const Component = ({ data }: ComponentProps) => { ... };
```

2. **Remove redundant `useMemo`** (except for very heavy computations):
```typescript
// Before:
const value = useMemo(() => computeValue(data), [data]);

// After:
const value = computeValue(data);
```

3. **Remove redundant `useCallback`** (except for external libraries):
```typescript
// Before:
const handleClick = useCallback(() => {
  onClick();
}, [onClick]);

// After:
const handleClick = () => {
  onClick();
};
```

### 9.5. Verifying React Compiler Work

React Compiler works automatically, but you can verify its work:

1. **Check in DevTools** - React DevTools will show optimized components
2. **Profiling** - use React Profiler to check re-renders
3. **Logging** - add `console.log` to track re-renders

### 9.6. Exceptions and Special Cases

React Compiler may not optimize:
- Components with `forwardRef` (require special attention)
- Components with `memo` and custom comparisons
- Complex conditional renders with side effects

In such cases, you can keep manual optimizations.

---

## 10. 🚀 Performance Optimization (Legacy - without React Compiler)

> ⚠️ **Note**: If `reactCompiler: true` is enabled in `next.config.ts`, most optimizations in this section are redundant. See section 9 "React Compiler".

### 10.1. Memoization
```typescript
import React, { memo, useMemo, useCallback } from 'react';

interface ExpensiveComponentProps {
  data: ComplexData[];
  onItemClick: (id: string) => void;
}

/**
 * Optimized component with memoization
 */
export const ExpensiveComponent = memo(({ 
  data, 
  onItemClick 
}: ExpensiveComponentProps) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: heavyComputation(item)
    }));
  }, [data]);

  const handleItemClick = useCallback((id: string) => {
    onItemClick(id);
  }, [onItemClick]);

  return (
    <div>
      {processedData.map(item => (
        <div key={item.id} onClick={() => handleItemClick(item.id)}>
          {item.name}
        </div>
      ))}
    </div>
  );
});
```

### 9.2. Lazy Loading
```typescript
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./HeavyComponent'));

/**
 * Example of Lazy Loading usage
 */
export const App = (): JSX.Element => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazyComponent />
  </Suspense>
);
```

---

## 11. 🤖 AI Assistant Instructions

When generating React components:

1. **Check React Compiler**: If `reactCompiler: true` is enabled in `next.config.ts`, avoid manual memoization (`memo`, `useMemo`, `useCallback`) unless specifically needed
2. **Identify Component Level**: Determine if it's an Atom, Molecule, Organism, Layout, or Page
3. **Create TypeScript Interface**: Define explicit props interface with proper typing
4. **Use Explicit Typing**: Use `(props: PropsType)` instead of `React.FC<PropsType>` for better type inference, generic support, and flexibility
5. **Follow Naming Conventions**: Use PascalCase for components, descriptive prop names
6. **Write Pure Components**: Components should be pure functions without mutations
7. **Include Accessibility**: Add appropriate ARIA attributes and keyboard navigation
8. **Handle Edge Cases**: Consider loading states, error states, and empty states
9. **Optimize Performance**: 
   - With React Compiler: Write clean code, compiler handles optimization
   - Without React Compiler: Use memo, useMemo, useCallback when appropriate
10. **Write Tests**: Include unit tests and accessibility tests
11. **Document Props**: Add JSDoc comments for all components and complex props (in English)

> **Example Prompt**: "Generate a reusable Modal component that follows accessibility guidelines, includes proper TypeScript typing, and can be used across different React frameworks."

---

## 12. 📚 References

- [React Documentation](https://react.dev/)
- [React Compiler](https://react.dev/learn/react-compiler) - Automatic optimization of React components
- [Next.js React Compiler](https://nextjs.org/docs/app/api-reference/next-config-js/reactCompiler) - React Compiler configuration in Next.js
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Testing Library](https://testing-library.com/)
- [Jest Axe](https://github.com/nickcolley/jest-axe)
- [React Performance](https://react.dev/learn/render-and-commit)

> ✅ **This document provides universal React component guidelines** that work across all React-based frameworks while maintaining best practices for accessibility, performance, and maintainability.
