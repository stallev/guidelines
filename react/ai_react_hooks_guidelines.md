# Universal React Hooks Guidelines

This document provides comprehensive guidelines for creating React hooks that are framework-agnostic and can be used across different React-based frameworks (Next.js, Astro, Remix, etc.). These guidelines focus on universal React patterns and best practices for custom hooks.

---

## 1. 🎯 Core Philosophy

- **Hooks = Logic Containers**: Hooks should contain business logic, not UI components
- **Reusability First**: Hooks should be designed for reuse across different components and projects
- **Single Responsibility**: Each hook should have one clear purpose
- **Type Safety**: All hooks must be fully typed with TypeScript
- **Performance Conscious**: Hooks should be optimized for performance and avoid unnecessary re-renders

---

## 2. 📁 Hook Organization and Structure

### 2.1. Directory Structure
```
src/
├── hooks/
│   ├── data/
│   │   ├── useApi.ts
│   │   ├── useLocalStorage.ts
│   │   └── useQuery.ts
│   ├── ui/
│   │   ├── useModal.ts
│   │   ├── useToggle.ts
│   │   └── useFocus.ts
│   ├── form/
│   │   ├── useForm.ts
│   │   ├── useValidation.ts
│   │   └── useField.ts
│   └── index.ts
```

### 2.2. Hook Naming Conventions
- **Format**: `use{Action}{Entity}` or `use{Entity}{Action}`
- **Examples**: `useToggle`, `useApi`, `useForm`, `useLocalStorage`, `useDebounce`
- **File naming**: `use{Name}.ts` (or `.tsx` only if JSX is embedded)

---

## 3. 🧪 Hook Design Standards

### 3.1. Basic Hook Structure
```typescript
import { useState, useEffect, useCallback, useMemo } from 'react';

interface UseCounterOptions {
  initialValue?: number;
  step?: number;
  min?: number;
  max?: number;
}

interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setCount: (value: number) => void;
}

export const useCounter = (options: UseCounterOptions = {}): UseCounterReturn => {
  const { initialValue = 0, step = 1, min, max } = options;
  
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(prev => {
      const newValue = prev + step;
      return max !== undefined ? Math.min(newValue, max) : newValue;
    });
  }, [step, max]);

  const decrement = useCallback(() => {
    setCount(prev => {
      const newValue = prev - step;
      return min !== undefined ? Math.max(newValue, min) : newValue;
    });
  }, [step, min]);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  const setCountValue = useCallback((value: number) => {
    setCount(prev => {
      if (min !== undefined && value < min) return min;
      if (max !== undefined && value > max) return max;
      return value;
    });
  }, [min, max]);

  return {
    count,
    increment,
    decrement,
    reset,
    setCount: setCountValue,
  };
};
```

### 3.2. Return Value Patterns
Hooks should return only:
- **Data**: `data`, `value`, `state`
- **State flags**: `isLoading`, `isError`, `isSuccess`
- **Actions**: `mutate`, `refetch`, `reset`
- **Never return**: JSX, styles, or components

---

## 4. 🔄 Data Management Hooks

### 4.1. API Data Hook
```typescript
interface UseApiOptions<T> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  dependencies?: any[];
  enabled?: boolean;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  mutate: (data: any) => Promise<void>;
}

export const useApi = <T>(options: UseApiOptions<T>): UseApiReturn<T> => {
  const { url, method = 'GET', body, headers, dependencies = [], enabled = true } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [url, method, body, headers, enabled]);

  const mutate = useCallback(async (newData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(newData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [url, headers]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate,
  };
};
```

### 4.2. Local Storage Hook
```typescript
interface UseLocalStorageOptions<T> {
  key: string;
  defaultValue: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

export const useLocalStorage = <T>(options: UseLocalStorageOptions<T>) => {
  const { key, defaultValue, serialize = JSON.stringify, deserialize = JSON.parse } = options;
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, serialize(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serialize, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(defaultValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [storedValue, setValue, removeValue] as const;
};
```

---

## 5. 🎨 UI Interaction Hooks

### 5.1. Toggle Hook
```typescript
interface UseToggleReturn {
  isOn: boolean;
  toggle: () => void;
  turnOn: () => void;
  turnOff: () => void;
}

export const useToggle = (initialValue: boolean = false): UseToggleReturn => {
  const [isOn, setIsOn] = useState(initialValue);

  const toggle = useCallback(() => setIsOn(prev => !prev), []);
  const turnOn = useCallback(() => setIsOn(true), []);
  const turnOff = useCallback(() => setIsOn(false), []);

  return { isOn, toggle, turnOn, turnOff };
};
```

### 5.2. Modal Hook
```typescript
interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useModal = (initialOpen: boolean = false): UseModalReturn => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, close]);

  return { isOpen, open, close, toggle };
};
```

### 5.3. Focus Management Hook
```typescript
interface UseFocusReturn {
  isFocused: boolean;
  focus: () => void;
  blur: () => void;
  ref: React.RefObject<HTMLElement>;
}

export const useFocus = (): UseFocusReturn => {
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const focus = useCallback(() => {
    ref.current?.focus();
  }, []);

  const blur = useCallback(() => {
    ref.current?.blur();
  }, []);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, [handleFocus, handleBlur]);

  return { isFocused, focus, blur, ref };
};
```

---

## 6. 📝 Form Management Hooks

### 6.1. Form Hook
```typescript
interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: (values: T) => Record<keyof T, string>;
  onSubmit: (values: T) => void | Promise<void>;
}

interface UseFormReturn<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  setValue: (field: keyof T, value: any) => void;
  setError: (field: keyof T, error: string) => void;
  setTouched: (field: keyof T, touched: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
  reset: () => void;
}

export const useForm = <T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> => {
  const { initialValues, validationSchema, onSubmit } = options;
  
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const setTouched = useCallback((field: keyof T, touched: boolean) => {
    setTouched(prev => ({ ...prev, [field]: touched }));
  }, []);

  const validate = useCallback(() => {
    if (!validationSchema) return true;
    
    const newErrors = validationSchema(values);
    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  }, [values, validationSchema]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string>);
    setTouched({} as Record<keyof T, boolean>);
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = useMemo(() => {
    return Object.values(errors).every(error => !error) && 
           Object.values(values).every(value => value !== '');
  }, [errors, values]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setError,
    setTouched,
    handleSubmit,
    reset,
  };
};
```

### 6.2. Debounce Hook
```typescript
interface UseDebounceOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
}

export const useDebounce = <T>(
  value: T,
  options: UseDebounceOptions = {}
): T => {
  const { delay = 500, leading = false, trailing = true } = options;
  
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (trailing) {
        setDebouncedValue(value);
      }
    }, delay);

    if (leading && debouncedValue !== value) {
      setDebouncedValue(value);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay, leading, trailing, debouncedValue]);

  return debouncedValue;
};
```

---

## 7. 🎯 Performance Optimization Hooks

### 7.1. Memo Hook
```typescript
interface UseMemoOptions<T> {
  dependencies: any[];
  factory: () => T;
  equalityFn?: (a: T, b: T) => boolean;
}

export const useMemo = <T>(options: UseMemoOptions<T>): T => {
  const { dependencies, factory, equalityFn = Object.is } = options;
  
  const [memoizedValue, setMemoizedValue] = useState<T>(factory);
  const [prevDeps, setPrevDeps] = useState(dependencies);

  useEffect(() => {
    const hasChanged = dependencies.some((dep, index) => 
      !equalityFn(dep, prevDeps[index])
    );

    if (hasChanged) {
      setMemoizedValue(factory());
      setPrevDeps(dependencies);
    }
  }, [dependencies, factory, equalityFn, prevDeps]);

  return memoizedValue;
};
```

### 7.2. Callback Hook
```typescript
export const useCallback = <T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[]
): T => {
  const callbackRef = useRef<T>(callback);
  const depsRef = useRef(dependencies);

  // Update callback if dependencies changed
  if (dependencies.some((dep, index) => dep !== depsRef.current[index])) {
    callbackRef.current = callback;
    depsRef.current = dependencies;
  }

  return useMemo(() => callbackRef.current, []);
};
```

---

## 8. 🛡️ Error Handling and Validation

### 8.1. Error Boundary Hook
```typescript
interface UseErrorBoundaryReturn {
  error: Error | null;
  resetError: () => void;
  captureError: (error: Error) => void;
}

export const useErrorBoundary = (): UseErrorBoundaryReturn => {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const captureError = useCallback((error: Error) => {
    setError(error);
  }, []);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      captureError(new Error(event.message));
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      captureError(new Error(event.reason));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [captureError]);

  return { error, resetError, captureError };
};
```

### 8.2. Validation Hook
```typescript
interface ValidationRule<T> {
  test: (value: T) => boolean;
  message: string;
}

interface UseValidationOptions<T> {
  rules: Record<keyof T, ValidationRule<T[keyof T]>[]>;
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
}

export const useValidation = <T extends Record<string, any>>(
  options: UseValidationOptions<T>
) => {
  const { rules, mode = 'onSubmit' } = options;
  
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);

  const validate = useCallback((values: T, fields?: (keyof T)[]): boolean => {
    const newErrors = {} as Record<keyof T, string>;
    const fieldsToValidate = fields || (Object.keys(rules) as (keyof T)[]);

    fieldsToValidate.forEach(field => {
      const fieldRules = rules[field];
      const value = values[field];

      for (const rule of fieldRules) {
        if (!rule.test(value)) {
          newErrors[field] = rule.message;
          break;
        }
      }
    });

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  }, [rules]);

  const clearErrors = useCallback(() => {
    setErrors({} as Record<keyof T, string>);
  }, []);

  const getFieldError = useCallback((field: keyof T): string => {
    return errors[field] || '';
  }, [errors]);

  return {
    errors,
    validate,
    clearErrors,
    getFieldError,
  };
};
```

---

## 9. 🧪 Testing Hooks

### 9.1. Hook Testing Utilities
```typescript
import { renderHook, act } from '@testing-library/react';

// Example test for useCounter hook
describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('should increment count', () => {
    const { result } = renderHook(() => useCounter({ initialValue: 0 }));
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  it('should respect max value', () => {
    const { result } = renderHook(() => useCounter({ 
      initialValue: 0, 
      max: 5 
    }));
    
    act(() => {
      result.current.setCount(10);
    });
    
    expect(result.current.count).toBe(5);
  });
});
```

---

## 10. 🤖 AI Assistant Instructions

When generating React hooks:

1. **Identify Hook Purpose**: Determine if it's for data, UI, form, or utility
2. **Create TypeScript Interface**: Define explicit input and return types
3. **Follow Naming Conventions**: Use `use` prefix and descriptive names
4. **Optimize Performance**: Use `useCallback`, `useMemo`, and `useRef` appropriately
5. **Handle Edge Cases**: Consider loading states, errors, and cleanup
6. **Write Tests**: Include comprehensive test coverage
7. **Document Usage**: Add JSDoc comments with examples
8. **Return Consistent Structure**: Follow established patterns for return values

> **Example Prompt**: "Generate a custom hook for managing API data with loading states, error handling, and caching capabilities that can be used across different React frameworks."

---

## 11. 📚 References

- [React Hooks Documentation](https://react.dev/reference/react)
- [Custom Hooks Guide](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Testing Library Hooks](https://testing-library.com/docs/react-testing-library/api/#renderhook)
- [React Hook Form](https://react-hook-form.com/)
- [SWR](https://swr.vercel.app/)

> ✅ **This document provides universal React hooks guidelines** that work across all React-based frameworks while maintaining best practices for performance, type safety, and reusability.
