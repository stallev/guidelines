# CSS Development Guidelines

## Core Principles

### File Organization
- **Single CSS file**: All styles must be in one file (`assets/css/styles.css`)
- **No inline styles**: Prohibit inline styling or separate CSS files
- **Assets organization**: All resources (CSS, JS, images, icons) must be in `assets/` directory
- **Structured organization**: Group styles by blocks with clear comments
- **Mobile-first approach**: Write base styles for mobile, then add media queries for larger screens

### CSS Architecture
- Use BEM methodology: `block__element--modifier`
- Group media queries next to their main selectors
- Organize styles by page sections (header, hero, windows, advantages, feedback, modal, footer)
- Use clear section comments for navigation and maintenance

## CSS Variables and Custom Properties

### Variable Usage
- **Maximize CSS custom properties** for all repeating values: colors, spacing, sizes, fonts
- Use variables for improved maintainability and scalability
- Define variables in `:root` selector
- Use semantic naming for variables

### Variable Structure
```css
:root {
  --color-primary: #3498db;
  --color-accent: #e74c3c;
  --color-bg: #f5f7fa;
  --color-text: #222;
  --color-white: #ffffff;
  --color-black: #000000;
  
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
  
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  
  --border-radius: 8px;
  --border-radius-lg: 12px;
  
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-fast: all 0.15s ease;
  --transition-slow: all 0.5s ease;
  
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

## Layout and Grid Systems

### CSS Grid and Flexbox
- Use CSS Grid for complex layouts and two-dimensional arrangements
- Use Flexbox for one-dimensional layouts and component alignment
- Create responsive grids without external frameworks
- Use `grid-template-areas` for semantic layout structure

### Grid Examples
```css
/* CSS Grid Layout */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-md);
}

/* Flexbox Layout */
.flex-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

@media (min-width: 768px) {
  .flex-container {
    flex-direction: row;
  }
}
```

## Responsive Design

### Mobile-First Approach
- Start with mobile styles as base
- Add media queries for larger screens
- Use relative units (rem, em, %) over fixed units (px)
- Test on actual devices, not just browser dev tools

### Breakpoint Strategy
```css
/* Mobile First - Base Styles */
.container {
  padding: var(--spacing-sm);
}

/* Small tablets */
@media (min-width: 520px) {
  .container {
    padding: var(--spacing-md);
  }
}

/* Tablets */
@media (min-width: 768px) {
  .container {
    padding: var(--spacing-lg);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: var(--spacing-xl);
  }
}

/* Large desktop */
@media (min-width: 1440px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

## BEM Methodology

### Naming Convention
- **Block**: Independent component (`.header`, `.button`, `.card`)
- **Element**: Part of a block (`.header__nav`, `.button__icon`, `.card__title`)
- **Modifier**: Variation of a block or element (`.button--primary`, `.card--featured`)

### BEM Examples
```css
/* Block */
.header { }

/* Element */
.header__nav { }
.header__logo { }
.header__menu { }

/* Modifier */
.header--fixed { }
.header__nav--mobile { }

/* Element with modifier */
.header__button--cta { }
```

## Component Structure

### Organized CSS Sections
```css
/* =====================
   HEADER
   ===================== */
.header {
  background: var(--color-white);
  box-shadow: var(--shadow-sm);
}

.header__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-sm);
}

.header__nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .header__nav {
    flex-direction: column;
  }
}

/* =====================
   HERO
   ===================== */
.hero {
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: var(--color-white);
  padding: var(--spacing-xl) 0;
}

.hero__title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--spacing-md);
}

/* =====================
   ADVANTAGES
   ===================== */
.advantages {
  padding: var(--spacing-xl) 0;
}

.advantage-card {
  background: var(--color-white);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
}

@media (min-width: 520px) {
  .advantages__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
}

@media (min-width: 768px) {
  .advantages__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Typography and Text

### Font System
- Use system fonts for better performance
- Define font stacks with fallbacks
- Use relative units for font sizes
- Ensure proper line height for readability

### Typography Example
```css
/* Font System */
:root {
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-heading: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-mono: 'Fira Code', 'Monaco', 'Consolas', monospace;
  
  --line-height-tight: 1.25;
  --line-height-base: 1.5;
  --line-height-relaxed: 1.75;
}

body {
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  color: var(--color-text);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-family-heading);
  font-weight: 700;
  line-height: var(--line-height-tight);
  margin-bottom: var(--spacing-sm);
}
```

## Animations and Transitions

### Animation Principles
- Use CSS animations for smooth interactions
- Prefer `transform` and `opacity` for performance
- Use `will-change` property for animated elements
- Provide reduced motion options for accessibility

### Animation Examples
```css
/* Transitions */
.button {
  transition: var(--transition);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Keyframe Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Accessibility and Focus

### Focus Management
- Visible focus indicators for all interactive elements
- Consistent focus styles across components
- High contrast focus indicators
- Skip links for keyboard navigation

### Focus Styles
```css
/* Focus Styles */
*:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Skip Link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--color-primary);
  color: var(--color-white);
  padding: var(--spacing-sm);
  text-decoration: none;
  border-radius: var(--border-radius);
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}

/* Button Focus */
.button:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

## Performance Optimization

### CSS Performance
- Minimize CSS file size
- Use efficient selectors
- Avoid deep nesting (max 3-4 levels)
- Use `contain` property for layout optimization
- Leverage CSS containment for better rendering

### Performance Examples
```css
/* Efficient Selectors */
.card { } /* Good */
div div div .card { } /* Avoid */

/* CSS Containment */
.card {
  contain: layout style paint;
}

/* Optimized Animations */
.animated-element {
  will-change: transform, opacity;
}

.animated-element.animation-complete {
  will-change: auto;
}
```

## Cross-Browser Compatibility

### Browser Support
- Support modern browsers (Chrome, Firefox, Safari, Edge)
- Use progressive enhancement
- Test on actual devices
- Use CSS prefixes when necessary

### Compatibility Examples
```css
/* Flexbox with fallbacks */
.container {
  display: -webkit-box; /* Old WebKit */
  display: -webkit-flex; /* WebKit */
  display: -ms-flexbox; /* IE 10 */
  display: flex; /* Modern browsers */
}

/* Grid with fallback */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* Fallback for older browsers */
@supports not (display: grid) {
  .grid {
    display: flex;
    flex-wrap: wrap;
  }
  
  .grid > * {
    flex: 1 1 300px;
  }
}
```

## CSS Validation Checklist

### Code Quality
- [ ] Single CSS file structure
- [ ] BEM methodology implementation
- [ ] CSS variables for repeated values
- [ ] Mobile-first responsive design
- [ ] Proper media query organization
- [ ] Semantic class naming
- [ ] Accessibility focus styles
- [ ] Performance-optimized animations
- [ ] Cross-browser compatibility
- [ ] Clean, maintainable code structure
