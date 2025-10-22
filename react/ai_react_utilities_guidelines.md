# Universal React Utility Functions Guidelines

This document provides comprehensive guidelines for creating React utility functions that are framework-agnostic and can be used across different React-based frameworks (Next.js, Astro, Remix, etc.). These guidelines focus on universal React patterns and best practices for utility functions.

---

## 1. 🎯 What Is a Utility Function?

A **utility function** is a **pure, stateless, side-effect-free function** that:
- Performs a single, well-defined transformation or computation
- Accepts input and returns output—nothing more
- Contains **no React dependencies** (`useState`, `useEffect`, etc.)
- Works identically in **Server Components**, **Client Components**, Node.js, and browsers
- Can be easily tested and reused across different contexts

> ✅ Examples: `formatDate()`, `slugify()`, `truncateText()`, `isEmail()`, `cn()`, `debounce()`  
> ❌ Not utilities: data fetchers, event handlers, state managers, or anything with `use*`

---

## 2. 🏗️ Utility Function Organization

### 2.1. Directory Structure
```
src/
├── utils/
│   ├── string/
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   ├── transform.ts
│   │   └── index.ts
│   ├── date/
│   │   ├── format.ts
│   │   ├── parse.ts
│   │   ├── calculate.ts
│   │   └── index.ts
│   ├── array/
│   │   ├── sort.ts
│   │   ├── filter.ts
│   │   ├── group.ts
│   │   └── index.ts
│   ├── object/
│   │   ├── merge.ts
│   │   ├── pick.ts
│   │   ├── omit.ts
│   │   └── index.ts
│   ├── dom/
│   │   ├── query.ts
│   │   ├── events.ts
│   │   ├── storage.ts
│   │   └── index.ts
│   ├── validation/
│   │   ├── email.ts
│   │   ├── phone.ts
│   │   ├── url.ts
│   │   └── index.ts
│   └── index.ts
```

### 2.2. File Organization Principles
- **Single Responsibility**: Each file should contain related utility functions
- **Thematic Grouping**: Group utilities by domain (string, date, array, etc.)
- **Barrel Exports**: Use index.ts files for clean imports
- **Consistent Naming**: Use descriptive, imperative function names

---

## 3. 🧪 Core Principles

### 3.1. Purity & Immutability
```typescript
// ✅ Pure function - same input always produces same output
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// ✅ Immutable - doesn't modify input
export const addItem = <T>(array: T[], item: T): T[] => {
  return [...array, item];
};

// ❌ Impure - modifies input
export const addItemMutating = <T>(array: T[], item: T): T[] => {
  array.push(item); // Mutates original array
  return array;
};
```

### 3.2. TypeScript-First
```typescript
// ✅ Explicit typing
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// ✅ Generic functions
export const groupBy = <T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    groups[groupKey] = groups[groupKey] || [];
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

// ✅ Union types for better type safety
export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};
```

### 3.3. Single Responsibility
```typescript
// ✅ Single responsibility
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// ✅ Another single responsibility
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// ❌ Multiple responsibilities
export const processText = (text: string): string => {
  // Does too many things: slugify, capitalize, truncate
  return truncateText(capitalize(slugify(text)), 50);
};
```

---

## 4. 📝 String Utilities

### 4.1. Text Formatting
```typescript
/**
 * Truncates text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 100)
 * @returns Truncated text with ellipsis
 * @example truncateText('Very long text...', 20) // 'Very long text...'
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Converts text to title case
 * @param text - Text to convert
 * @returns Title case text
 * @example toTitleCase('hello world') // 'Hello World'
 */
export const toTitleCase = (text: string): string => {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Removes HTML tags from text
 * @param html - HTML string
 * @returns Plain text
 * @example stripHtml('<p>Hello <strong>world</strong></p>') // 'Hello world'
 */
export const stripHtml = (html: string): string => {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

/**
 * Highlights search terms in text
 * @param text - Original text
 * @param searchTerm - Term to highlight
 * @param className - CSS class for highlighting
 * @returns HTML string with highlighted terms
 */
export const highlightText = (
  text: string, 
  searchTerm: string, 
  className: string = 'highlight'
): string => {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, `<span class="${className}">$1</span>`);
};
```

### 4.2. Text Validation
```typescript
/**
 * Validates email format
 * @param email - Email to validate
 * @returns True if valid email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates URL format
 * @param url - URL to validate
 * @returns True if valid URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates phone number format
 * @param phone - Phone number to validate
 * @returns True if valid phone number
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validates strong password
 * @param password - Password to validate
 * @returns Object with validation results
 */
export const validatePassword = (password: string) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    errors: {
      minLength: password.length < minLength,
      noUpperCase: !hasUpperCase,
      noLowerCase: !hasLowerCase,
      noNumbers: !hasNumbers,
      noSpecialChar: !hasSpecialChar,
    }
  };
};
```

---

## 5. 📅 Date Utilities

### 5.1. Date Formatting
```typescript
/**
 * Formats date to relative time (e.g., "2 hours ago")
 * @param date - Date to format
 * @returns Relative time string
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

/**
 * Formats date to readable string
 * @param date - Date to format
 * @param format - Format string (default: 'MMM dd, yyyy')
 * @returns Formatted date string
 */
export const formatDate = (date: Date, format: string = 'MMM dd, yyyy'): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  };
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

/**
 * Formats date to ISO string
 * @param date - Date to format
 * @returns ISO date string
 */
export const formatISODate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Formats time to 12-hour format
 * @param date - Date to format
 * @returns 12-hour time string
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};
```

### 5.2. Date Calculations
```typescript
/**
 * Calculates age from birth date
 * @param birthDate - Birth date
 * @returns Age in years
 */
export const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Calculates days between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of days
 */
export const daysBetween = (startDate: Date, endDate: Date): number => {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Checks if date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Checks if date is in the past
 * @param date - Date to check
 * @returns True if date is in the past
 */
export const isPast = (date: Date): boolean => {
  return date.getTime() < Date.now();
};
```

---

## 6. 🔢 Array Utilities

### 6.1. Array Manipulation
```typescript
/**
 * Removes duplicates from array
 * @param array - Array to deduplicate
 * @returns Array without duplicates
 */
export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

/**
 * Groups array by key
 * @param array - Array to group
 * @param key - Key to group by
 * @returns Grouped object
 */
export const groupBy = <T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    groups[groupKey] = groups[groupKey] || [];
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * Sorts array by key
 * @param array - Array to sort
 * @param key - Key to sort by
 * @param direction - Sort direction
 * @returns Sorted array
 */
export const sortBy = <T, K extends keyof T>(
  array: T[],
  key: K,
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Chunks array into smaller arrays
 * @param array - Array to chunk
 * @param size - Chunk size
 * @returns Array of chunks
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};
```

### 6.2. Array Filtering
```typescript
/**
 * Filters array by search term
 * @param array - Array to filter
 * @param searchTerm - Search term
 * @param keys - Keys to search in
 * @returns Filtered array
 */
export const searchArray = <T>(
  array: T[],
  searchTerm: string,
  keys: (keyof T)[]
): T[] => {
  if (!searchTerm) return array;
  
  const term = searchTerm.toLowerCase();
  return array.filter(item =>
    keys.some(key => {
      const value = item[key];
      return String(value).toLowerCase().includes(term);
    })
  );
};

/**
 * Filters array by multiple criteria
 * @param array - Array to filter
 * @param filters - Filter criteria
 * @returns Filtered array
 */
export const filterBy = <T>(
  array: T[],
  filters: Partial<T>
): T[] => {
  return array.filter(item =>
    Object.entries(filters).every(([key, value]) => {
      if (value === undefined) return true;
      return item[key as keyof T] === value;
    })
  );
};
```

---

## 7. 🗂️ Object Utilities

### 7.1. Object Manipulation
```typescript
/**
 * Deep merges two objects
 * @param target - Target object
 * @param source - Source object
 * @returns Merged object
 */
export const deepMerge = <T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T => {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key] as T[Extract<keyof T, string>];
    }
  }
  
  return result;
};

/**
 * Picks specific keys from object
 * @param obj - Source object
 * @param keys - Keys to pick
 * @returns Object with picked keys
 */
export const pick = <T, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

/**
 * Omits specific keys from object
 * @param obj - Source object
 * @param keys - Keys to omit
 * @returns Object without omitted keys
 */
export const omit = <T, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

/**
 * Checks if object is empty
 * @param obj - Object to check
 * @returns True if object is empty
 */
export const isEmpty = (obj: Record<string, any>): boolean => {
  return Object.keys(obj).length === 0;
};
```

### 7.2. Object Validation
```typescript
/**
 * Checks if object has all required keys
 * @param obj - Object to check
 * @param requiredKeys - Required keys
 * @returns True if object has all required keys
 */
export const hasRequiredKeys = <T>(
  obj: Record<string, any>,
  requiredKeys: (keyof T)[]
): obj is T => {
  return requiredKeys.every(key => key in obj);
};

/**
 * Validates object against schema
 * @param obj - Object to validate
 * @param schema - Validation schema
 * @returns Validation result
 */
export const validateObject = <T>(
  obj: Record<string, any>,
  schema: Record<keyof T, (value: any) => boolean>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  Object.entries(schema).forEach(([key, validator]) => {
    if (!validator(obj[key])) {
      errors.push(`Invalid value for ${key}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};
```

---

## 8. 🌐 DOM Utilities

### 8.1. DOM Queries
```typescript
/**
 * Finds element by selector
 * @param selector - CSS selector
 * @param parent - Parent element (default: document)
 * @returns Element or null
 */
export const findElement = <T extends Element>(
  selector: string,
  parent: Element | Document = document
): T | null => {
  return parent.querySelector(selector) as T | null;
};

/**
 * Finds all elements by selector
 * @param selector - CSS selector
 * @param parent - Parent element (default: document)
 * @returns NodeList of elements
 */
export const findElements = <T extends Element>(
  selector: string,
  parent: Element | Document = document
): NodeListOf<T> => {
  return parent.querySelectorAll(selector) as NodeListOf<T>;
};

/**
 * Checks if element is visible
 * @param element - Element to check
 * @returns True if element is visible
 */
export const isVisible = (element: Element): boolean => {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
};
```

### 8.2. Storage Utilities
```typescript
/**
 * Gets item from localStorage with type safety
 * @param key - Storage key
 * @param defaultValue - Default value
 * @returns Stored value or default
 */
export const getStorageItem = <T>(
  key: string,
  defaultValue: T
): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * Sets item in localStorage with type safety
 * @param key - Storage key
 * @param value - Value to store
 * @returns True if successful
 */
export const setStorageItem = <T>(key: string, value: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

/**
 * Removes item from localStorage
 * @param key - Storage key
 * @returns True if successful
 */
export const removeStorageItem = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};
```

---

## 9. 🎨 Styling Utilities

### 9.1. CSS Class Utilities
```typescript
/**
 * Combines class names conditionally
 * @param classes - Class names to combine
 * @returns Combined class string
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Generates responsive class names
 * @param base - Base classes
 * @param responsive - Responsive classes
 * @returns Responsive class string
 */
export const responsiveClasses = (
  base: string,
  responsive: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  }
): string => {
  const classes = [base];
  
  if (responsive.sm) classes.push(`sm:${responsive.sm}`);
  if (responsive.md) classes.push(`md:${responsive.md}`);
  if (responsive.lg) classes.push(`lg:${responsive.lg}`);
  if (responsive.xl) classes.push(`xl:${responsive.xl}`);
  
  return classes.join(' ');
};

/**
 * Generates variant classes
 * @param base - Base class
 * @param variants - Variant classes
 * @param variant - Selected variant
 * @returns Variant class string
 */
export const variantClasses = <T extends string>(
  base: string,
  variants: Record<T, string>,
  variant: T
): string => {
  return cn(base, variants[variant]);
};
```

### 9.2. Style Calculations
```typescript
/**
 * Calculates contrast ratio between colors
 * @param color1 - First color
 * @param color2 - Second color
 * @returns Contrast ratio
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    const rgb = color.match(/\d+/g);
    if (!rgb) return 0;
    
    const [r, g, b] = rgb.map(c => {
      const val = parseInt(c) / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Generates CSS custom properties
 * @param properties - CSS properties
 * @returns CSS custom properties string
 */
export const generateCSSProperties = (properties: Record<string, string>): string => {
  return Object.entries(properties)
    .map(([key, value]) => `--${key}: ${value};`)
    .join(' ');
};
```

---

## 10. 🛡️ Security and Validation

### 10.1. Input Sanitization
```typescript
/**
 * Sanitizes HTML content
 * @param html - HTML to sanitize
 * @returns Sanitized HTML
 */
export const sanitizeHtml = (html: string): string => {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
};

/**
 * Escapes HTML special characters
 * @param text - Text to escape
 * @returns Escaped HTML
 */
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

/**
 * Validates and sanitizes user input
 * @param input - User input
 * @param maxLength - Maximum length
 * @returns Sanitized input
 */
export const sanitizeInput = (input: string, maxLength: number = 1000): string => {
  return escapeHtml(input.trim().slice(0, maxLength));
};
```

### 10.2. Data Validation
```typescript
/**
 * Validates JSON string
 * @param json - JSON string to validate
 * @returns Validation result
 */
export const validateJSON = (json: string): { isValid: boolean; data?: any; error?: string } => {
  try {
    const data = JSON.parse(json);
    return { isValid: true, data };
  } catch (error) {
    return { isValid: false, error: error instanceof Error ? error.message : 'Invalid JSON' };
  }
};

/**
 * Validates required fields
 * @param data - Data to validate
 * @param requiredFields - Required field names
 * @returns Validation result
 */
export const validateRequiredFields = (
  data: Record<string, any>,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } => {
  const missingFields = requiredFields.filter(field => !data[field]);
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};
```

---

## 11. 🧪 Testing Utilities

### 11.1. Test Helpers
```typescript
/**
 * Creates mock data for testing
 * @param template - Data template
 * @param count - Number of items to generate
 * @returns Array of mock data
 */
export const createMockData = <T>(
  template: T,
  count: number = 1
): T[] => {
  return Array.from({ length: count }, (_, index) => ({
    ...template,
    id: `mock-${index}`,
  }));
};

/**
 * Generates random string for testing
 * @param length - String length
 * @returns Random string
 */
export const generateRandomString = (length: number = 10): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generates random email for testing
 * @returns Random email
 */
export const generateRandomEmail = (): string => {
  const username = generateRandomString(8);
  const domain = generateRandomString(5);
  return `${username}@${domain}.com`;
};
```

---

## 12. 🤖 AI Assistant Instructions

When generating utility functions:

1. **Identify Function Purpose**: Determine if it's for data transformation, validation, formatting, or manipulation
2. **Ensure Purity**: Functions must be pure with no side effects
3. **Add TypeScript Types**: Include explicit input and output types
4. **Write JSDoc**: Add comprehensive documentation with examples
5. **Handle Edge Cases**: Consider null, undefined, and invalid inputs
6. **Optimize Performance**: Use efficient algorithms and avoid unnecessary operations
7. **Test Thoroughly**: Include unit tests for all functions
8. **Export Consistently**: Use named exports for better tree-shaking

> **Example Prompt**: "Generate utility functions for form validation that can be used across different React frameworks, including email validation, password strength checking, and input sanitization."

---

## 13. 📚 References

- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [Lodash Documentation](https://lodash.com/docs)
- [Date-fns Documentation](https://date-fns.org/)
- [Validator.js Documentation](https://github.com/validatorjs/validator.js)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

> ✅ **This document provides universal React utility function guidelines** that work across all React-based frameworks while maintaining purity, type safety, and performance.
