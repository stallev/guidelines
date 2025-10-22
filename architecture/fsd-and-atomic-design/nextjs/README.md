# Next.js FSD + Atomic Design Architecture

This directory contains comprehensive architectural guidelines for Next.js applications using Feature-Sliced Design (FSD) and Atomic Design principles.

## 📁 Contents

### [Master Architecture Guideline](./master_architecture_guideline.md)
**Complete Next.js App Router + FSD + Atomic Design Guide**

Comprehensive architectural guidelines covering:
- Project structure and layer organization
- Server and Client Component patterns
- Data fetching strategies
- State management with React Query
- Performance optimization
- Testing strategies
- Deployment considerations

## 🏗️ Architecture Overview

### FSD Layers in Next.js
```
app/                    # Next.js App Router
├── (routes)/          # Pages layer
├── shared/            # Global utilities and UI
├── entities/          # Domain models
├── features/          # User actions
└── widgets/           # Complex UI blocks
```

### Atomic Design in FSD
```
shared/ui/
├── atoms/             # Basic UI elements
├── molecules/         # Simple component groups
└── organisms/         # Complex UI sections (in widgets/)
```

## 🎯 Key Principles

1. **Server-First**: Leverage Next.js Server Components by default
2. **Client Islands**: Use Client Components only when interactivity is needed
3. **Type Safety**: Full TypeScript support with strict typing
4. **Performance**: Optimized for Core Web Vitals
5. **Accessibility**: WCAG 2.1 AA compliance
6. **Testing**: Comprehensive testing strategies

## 🚀 Getting Started

1. **Read the Master Guide**: Start with the comprehensive architecture guide
2. **Set Up Project Structure**: Follow the recommended directory structure
3. **Implement Patterns**: Apply FSD and Atomic Design principles
4. **Add Testing**: Include comprehensive test coverage
5. **Optimize Performance**: Follow performance guidelines

## 📚 Related Guidelines

- [React Guidelines](../../../react/) - Universal React patterns
- [Next.js Guidelines](../../../nextjs/) - Framework-specific patterns
- [TypeScript Guidelines](../../../typescript/) - Type safety patterns

## 🔧 Tools and Technologies

- **Next.js 15+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Query** for data fetching
- **Zod** for validation
- **Testing Library** for testing

---

> ✅ **This architecture provides a solid foundation for building scalable Next.js applications** that are maintainable, performant, and developer-friendly.
