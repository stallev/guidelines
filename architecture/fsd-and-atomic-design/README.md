# FSD and Atomic Design Architecture

This directory contains architectural guidelines that combine Feature-Sliced Design (FSD) with Atomic Design principles for building scalable React applications.

## 📁 Contents

### [Next.js](./nextjs/)
**Next.js App Router + FSD + Atomic Design**

Comprehensive architectural guidelines for Next.js applications using Feature-Sliced Design and Atomic Design:
- Project structure with FSD layers
- Atomic Design component hierarchy
- Server and Client Component patterns
- Data fetching and state management
- Performance optimization strategies

## 🏗️ Architecture Overview

### Feature-Sliced Design (FSD)
FSD provides a methodology for organizing code into clear, hierarchical layers:

```
pages → widgets → features → entities → shared
```

**Key Principles:**
- **Unidirectional Dependencies**: Higher layers can import from lower layers, never the reverse
- **Business Logic Separation**: Clear boundaries between UI and business logic
- **Scalability**: Easy to add new features without breaking existing code

### Atomic Design
Atomic Design organizes UI components by complexity:

```
Atoms → Molecules → Organisms → Templates → Pages
```

**Key Principles:**
- **Reusability**: Components are designed for maximum reuse
- **Composition**: Complex components are built from simpler ones
- **Consistency**: Design system approach ensures visual consistency

## 🎯 Benefits

Combining FSD with Atomic Design provides:
- **Clear Structure**: Easy to understand and navigate
- **Reusability**: Components and logic can be reused across features
- **Maintainability**: Changes are isolated to specific layers
- **Scalability**: Easy to add new features and components
- **Team Collaboration**: Clear boundaries for different team members

## 🚀 Getting Started

1. **Understand the Layers**: Learn how FSD layers work together
2. **Component Hierarchy**: Learn Atomic Design component organization
3. **Framework Integration**: See how these patterns work with specific frameworks
4. **Best Practices**: Follow established patterns for consistency

## 📚 Related Guidelines

- [React Guidelines](../../react/) - Component and hook patterns
- [Next.js Guidelines](../../nextjs/) - Framework-specific implementation
- [TypeScript Guidelines](../../typescript/) - Type safety patterns

---

> ✅ **This architecture scales from small projects to large enterprise applications** while maintaining code quality and developer productivity.
