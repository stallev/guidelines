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

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
  className,
  'aria-label': ariaLabel,
  ...props
}) => {
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

export const Button = ({ className, ...props }) => (
  <button className={cn(styles.button, className)} {...props} />
);
```

**Option B: Utility Classes (Tailwind CSS)**
```typescript
export const Button = ({ className, ...props }) => (
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

const Card = ({ children, className }: CardProps) => (
  <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}>
    {children}
  </div>
);

const CardHeader = ({ children, className }: CardHeaderProps) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)}>
    {children}
  </div>
);

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

export const DataFetcher = <T,>({ url, children }: DataFetcherProps<T>) => {
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

export const withLoading = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P & WithLoadingProps) => {
    const { isLoading, ...restProps } = props;
    
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    return <Component {...(restProps as P)} />;
  };
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

const DefaultErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({ 
  error, 
  resetError 
}) => (
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

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-expanded': ariaExpanded,
  'aria-pressed': ariaPressed,
  role,
  ...props
}) => (
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
export const useFocusTrap = (isActive: boolean) => {
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

## 7. 🧪 Testing Guidelines

### 7.1. Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 7.2. Accessibility Testing
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
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

## 9. 🚀 Performance Optimization

### 9.1. Memoization
```typescript
import React, { memo, useMemo, useCallback } from 'react';

interface ExpensiveComponentProps {
  data: ComplexData[];
  onItemClick: (id: string) => void;
}

export const ExpensiveComponent = memo<ExpensiveComponentProps>(({ 
  data, 
  onItemClick 
}) => {
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

export const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazyComponent />
  </Suspense>
);
```

---

## 10. 🤖 AI Assistant Instructions

When generating React components:

1. **Identify Component Level**: Determine if it's an Atom, Molecule, Organism, Layout, or Page
2. **Create TypeScript Interface**: Define explicit props interface with proper typing
3. **Follow Naming Conventions**: Use PascalCase for components, descriptive prop names
4. **Include Accessibility**: Add appropriate ARIA attributes and keyboard navigation
5. **Handle Edge Cases**: Consider loading states, error states, and empty states
6. **Optimize Performance**: Use memo, useMemo, useCallback when appropriate
7. **Write Tests**: Include unit tests and accessibility tests
8. **Document Props**: Add JSDoc comments for complex props

> **Example Prompt**: "Generate a reusable Modal component that follows accessibility guidelines, includes proper TypeScript typing, and can be used across different React frameworks."

---

## 11. 📚 References

- [React Documentation](https://react.dev/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Testing Library](https://testing-library.com/)
- [Jest Axe](https://github.com/nickcolley/jest-axe)
- [React Performance](https://react.dev/learn/render-and-commit)

> ✅ **This document provides universal React component guidelines** that work across all React-based frameworks while maintaining best practices for accessibility, performance, and maintainability.
