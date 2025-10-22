# Universal React TypeScript Types & Interfaces Guidelines

This document provides comprehensive guidelines for creating TypeScript types and interfaces that are framework-agnostic and can be used across different React-based frameworks (Next.js, Astro, Remix, etc.). These guidelines focus on universal React patterns and best practices for type safety.

---

## 1. 🎯 Core Principles

### 1.1. Type-Driven Development
- All public contracts **must** be explicitly typed: component props, API payloads, domain models, hook returns
- **Never** use `any` or unvalidated `unknown` in production code
- Prefer `interface` for object-shaped contracts; `type` for unions, primitives, and computed types
- Favor **immutability**: use `readonly`, `ReadonlyArray<T>`, and `as const` where appropriate
- Use **discriminated unions** for complex state management

### 1.2. Single Source of Truth
- Define types close to where they're used
- Use **barrel exports** to control visibility
- Avoid circular dependencies between type definitions
- Prefer composition over inheritance in type design

---

## 2. 🏗️ Type Organization and Structure

### 2.1. Directory Structure
```
src/
├── types/
│   ├── api/
│   │   ├── requests.ts
│   │   ├── responses.ts
│   │   └── index.ts
│   ├── components/
│   │   ├── ui.ts
│   │   ├── forms.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── data.ts
│   │   ├── ui.ts
│   │   └── index.ts
│   ├── domain/
│   │   ├── user.ts
│   │   ├── product.ts
│   │   └── index.ts
│   └── index.ts
```

### 2.2. Type Naming Conventions
- **Interfaces**: PascalCase with descriptive suffix (`UserProps`, `ApiResponse`)
- **Types**: PascalCase for unions, camelCase for primitives (`Status`, `userId`)
- **Generics**: Single uppercase letters (`T`, `K`, `V`) or descriptive names (`TData`, `TError`)
- **Enums**: PascalCase (`UserRole`, `OrderStatus`)

---

## 3. 🧩 Component Types

### 3.1. Basic Component Props
```typescript
// Base component props interface
interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

// Specific component props
interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// Generic component props
interface ListProps<T> extends BaseComponentProps {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  emptyState?: React.ReactNode;
}
```

### 3.2. Form Component Types
```typescript
// Form field types
interface FormFieldProps<T = string> extends BaseComponentProps {
  name: string;
  value: T;
  onChange: (value: T) => void;
  onBlur?: () => void;
  error?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

// Form validation types
interface ValidationRule<T> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
}

interface FormSchema<T> {
  [K in keyof T]: ValidationRule<T[K]>;
}

// Form state types
interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}
```

### 3.3. Layout Component Types
```typescript
// Layout props
interface LayoutProps extends BaseComponentProps {
  title?: string;
  description?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sidebar?: React.ReactNode;
  main?: React.ReactNode;
}

// Grid system types
interface GridProps extends BaseComponentProps {
  columns?: number;
  gap?: number;
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

// Container types
interface ContainerProps extends BaseComponentProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  center?: boolean;
}
```

---

## 4. 🔄 Hook Types

### 4.1. Data Hook Types
```typescript
// Generic API hook types
interface UseApiOptions<T> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  dependencies?: any[];
  enabled?: boolean;
  retry?: number;
  retryDelay?: number;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  mutate: (data: any) => Promise<void>;
  reset: () => void;
}

// Query hook types
interface UseQueryOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  retry?: boolean | number;
  retryDelay?: number;
}

interface UseQueryReturn<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
  isStale: boolean;
}
```

### 4.2. UI Hook Types
```typescript
// Modal hook types
interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

// Toggle hook types
interface UseToggleReturn {
  isOn: boolean;
  toggle: () => void;
  turnOn: () => void;
  turnOff: () => void;
}

// Focus hook types
interface UseFocusReturn {
  isFocused: boolean;
  focus: () => void;
  blur: () => void;
  ref: React.RefObject<HTMLElement>;
}

// Local storage hook types
interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}
```

### 4.3. Form Hook Types
```typescript
// Form hook types
interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  setValue: (field: keyof T, value: any) => void;
  setError: (field: keyof T, error: string) => void;
  setTouched: (field: keyof T, touched: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
  reset: () => void;
  validate: () => boolean;
}

// Field hook types
interface UseFieldOptions<T> {
  name: keyof T;
  validate?: (value: T[keyof T]) => string | null;
  transform?: (value: any) => T[keyof T];
}

interface UseFieldReturn<T> {
  value: T[keyof T];
  error: string;
  touched: boolean;
  setValue: (value: T[keyof T]) => void;
  setTouched: (touched: boolean) => void;
  setError: (error: string) => void;
}
```

---

## 5. 🌐 API and Data Types

### 5.1. API Request/Response Types
```typescript
// Generic API types
interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  timestamp: string;
}

interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Pagination types
interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// HTTP method types
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestConfig {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}
```

### 5.2. Domain Entity Types
```typescript
// Base entity interface
interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

// User entity
interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
}

// Product entity
interface Product extends BaseEntity {
  name: string;
  description: string;
  price: number;
  currency: string;
  category: ProductCategory;
  tags: string[];
  images: ProductImage[];
  inventory: Inventory;
  isAvailable: boolean;
}

// Order entity
interface Order extends BaseEntity {
  userId: string;
  items: OrderItem[];
  total: number;
  currency: string;
  status: OrderStatus;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  notes?: string;
}
```

### 5.3. Enum and Union Types
```typescript
// User roles
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
  GUEST = 'guest',
}

// Product categories
enum ProductCategory {
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  BOOKS = 'books',
  HOME = 'home',
  SPORTS = 'sports',
}

// Order status
enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

// Status unions
type LoadingState = 'idle' | 'loading' | 'success' | 'error';
type Theme = 'light' | 'dark' | 'system';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
```

---

## 6. 🎨 Styling and Theme Types

### 6.1. Theme Types
```typescript
// Color palette
interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

// Spacing scale
interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

// Typography
interface Typography {
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

// Complete theme interface
interface Theme {
  colors: ColorPalette;
  spacing: Spacing;
  typography: Typography;
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}
```

### 6.2. Styled Components Types
```typescript
// Styled component props
interface StyledButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
}

// CSS-in-JS types
interface CSSProperties {
  [key: string]: string | number | CSSProperties;
}

// Responsive props
interface ResponsiveProps<T> {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}
```

---

## 7. 🛡️ Error Handling Types

### 7.1. Error Types
```typescript
// Base error interface
interface BaseError {
  message: string;
  code: string;
  timestamp: string;
  stack?: string;
}

// API error
interface ApiError extends BaseError {
  status: number;
  statusText: string;
  url: string;
  method: string;
}

// Validation error
interface ValidationError extends BaseError {
  field: string;
  value: any;
  rule: string;
}

// Network error
interface NetworkError extends BaseError {
  type: 'network' | 'timeout' | 'abort';
  url: string;
}

// Error boundary types
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}
```

### 7.2. Result Types
```typescript
// Result pattern for error handling
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Async result
type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

// Option type for nullable values
type Option<T> = T | null | undefined;

// Maybe type for optional values
type Maybe<T> = T | null;
```

---

## 8. 🔧 Utility Types

### 8.1. Generic Utility Types
```typescript
// Make all properties optional
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Make all properties required
type Required<T> = {
  [P in keyof T]-?: T[P];
};

// Pick specific properties
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Omit specific properties
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Make specific properties optional
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make specific properties required
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Deep partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Deep required
type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};
```

### 8.2. React-Specific Utility Types
```typescript
// Component props without ref
type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

// Ref type
type RefType<T> = T extends React.ComponentType<infer P> 
  ? P extends { ref?: infer R } 
    ? R 
    : never 
  : never;

// Event handler type
type EventHandler<T = HTMLElement> = (event: React.SyntheticEvent<T>) => void;

// Form event handler
type FormEventHandler<T = HTMLFormElement> = (event: React.FormEvent<T>) => void;

// Change event handler
type ChangeEventHandler<T = HTMLInputElement> = (event: React.ChangeEvent<T>) => void;

// Click event handler
type ClickEventHandler<T = HTMLElement> = (event: React.MouseEvent<T>) => void;
```

---

## 9. 🧪 Testing Types

### 9.1. Test Utility Types
```typescript
// Mock function type
type MockFunction<T extends (...args: any[]) => any> = jest.MockedFunction<T>;

// Test props type
type TestProps<T> = T & {
  'data-testid'?: string;
  'data-cy'?: string;
};

// Render result type
interface RenderResult {
  container: HTMLElement;
  getByTestId: (id: string) => HTMLElement;
  getByText: (text: string) => HTMLElement;
  getByRole: (role: string) => HTMLElement;
  queryByTestId: (id: string) => HTMLElement | null;
  rerender: (ui: React.ReactElement) => void;
  unmount: () => void;
}
```

### 9.2. Hook Testing Types
```typescript
// Hook test result
interface HookTestResult<T> {
  result: { current: T };
  rerender: (props?: any) => void;
  unmount: () => void;
}

// Hook test options
interface HookTestOptions {
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
  initialProps?: any;
}
```

---

## 10. 🤖 AI Assistant Instructions

When generating TypeScript types:

1. **Identify Type Category**: Determine if it's for components, hooks, API, domain, or utilities
2. **Use Appropriate Naming**: Follow PascalCase for interfaces, descriptive names for types
3. **Leverage Generics**: Use generics for reusable type patterns
4. **Include JSDoc**: Add comprehensive documentation for complex types
5. **Consider Composition**: Prefer composition over inheritance
6. **Handle Edge Cases**: Include optional properties and error states
7. **Use Utility Types**: Leverage built-in TypeScript utility types
8. **Export Consistently**: Use barrel exports for better organization

> **Example Prompt**: "Generate TypeScript types for a reusable DataTable component that supports sorting, filtering, pagination, and can work with any data type across different React frameworks."

---

## 11. 📚 References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [React Component Types](https://react.dev/reference/react/Component)
- [Testing Library Types](https://testing-library.com/docs/react-testing-library/api/)

> ✅ **This document provides universal TypeScript type guidelines** that work across all React-based frameworks while maintaining type safety, performance, and developer experience.
