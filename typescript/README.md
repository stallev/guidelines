# TypeScript Guidelines

This directory contains comprehensive guidelines and best practices for using TypeScript in modern web development.

## 📁 Contents

### [AI React Types Guidelines](./ai_react_types_guidelines.md)
**Universal React TypeScript Types & Interfaces Guidelines**

Comprehensive TypeScript guidelines for React applications:
- Type organization and structure
- Component prop types
- Hook return types
- API and data types
- Domain entity types
- Utility types
- Testing types

## 🎯 What is TypeScript?

TypeScript is a strongly typed programming language that:
- **Type Safety**: Catches errors at compile time
- **Better IDE Support**: Enhanced autocomplete and refactoring
- **Documentation**: Types serve as living documentation
- **Scalability**: Easier to maintain large codebases
- **Modern JavaScript**: Supports latest JavaScript features

## 🚀 Key Benefits

- **Error Prevention**: Catch bugs before they reach production
- **Developer Experience**: Better autocomplete and IntelliSense
- **Code Quality**: Enforce coding standards and patterns
- **Refactoring**: Safe code refactoring with type checking
- **Team Collaboration**: Clear interfaces and contracts

## 📚 Related Guidelines

- [React Guidelines](../react/) - React component patterns
- [Next.js Guidelines](../nextjs/) - Framework-specific patterns
- [Architecture Guidelines](../architecture/) - Project structure
- [Design Guidelines](../design/) - UI/UX patterns

## 🔧 Tools and Technologies

- **TypeScript** - Type-safe JavaScript
- **React** - Component library with TypeScript
- **Next.js** - Framework with TypeScript support
- **Testing** - Jest, Testing Library with TypeScript
- **Build Tools** - Webpack, Vite, esbuild
- **Linting** - ESLint with TypeScript rules

## 🏗️ TypeScript Patterns

### Basic Types
- **Primitives**: string, number, boolean, null, undefined
- **Arrays**: Array<T> or T[]
- **Objects**: { key: value } or Record<string, T>
- **Functions**: (param: T) => R
- **Unions**: string | number | boolean
- **Intersections**: A & B

### Advanced Types
- **Generics**: <T> for reusable type parameters
- **Utility Types**: Partial<T>, Required<T>, Pick<T, K>
- **Conditional Types**: T extends U ? X : Y
- **Mapped Types**: { [K in keyof T]: T[K] }
- **Template Literals**: `Hello ${T}`

### React-Specific Types
- **Component Props**: React.ComponentProps<T>
- **Event Handlers**: React.ChangeEventHandler<T>
- **Refs**: React.RefObject<T>
- **Children**: React.ReactNode
- **State**: React.Dispatch<React.SetStateAction<T>>

## 🎨 Type Organization

### Directory Structure
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

### Naming Conventions
- **Interfaces**: PascalCase (UserProps, ApiResponse)
- **Types**: PascalCase for unions, camelCase for primitives
- **Generics**: Single uppercase letters (T, K, V) or descriptive names
- **Enums**: PascalCase (UserRole, OrderStatus)

## 🧪 Testing with TypeScript

### Type Testing
- **Type Guards**: Runtime type checking
- **Assertion Functions**: Type narrowing
- **Mock Types**: Type-safe mocking
- **Test Utilities**: Type-safe test helpers

### Best Practices
- **Strict Mode**: Enable strict TypeScript settings
- **No Any**: Avoid using 'any' type
- **Explicit Types**: Use explicit types for public APIs
- **Type Documentation**: Document complex types with JSDoc
- **Regular Updates**: Keep TypeScript and types up to date

## 🔍 TypeScript Configuration

### Recommended Settings
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### ESLint Rules
- **@typescript-eslint/no-explicit-any**: Disallow 'any' type
- **@typescript-eslint/no-unused-vars**: Disallow unused variables
- **@typescript-eslint/explicit-function-return-type**: Require return types
- **@typescript-eslint/prefer-const**: Prefer const assertions

---

> ✅ **This directory provides comprehensive TypeScript guidelines** that help you build type-safe, maintainable, and scalable applications.
