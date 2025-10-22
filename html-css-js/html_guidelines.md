# HTML Development Guidelines

## Core Principles

### Semantic HTML Structure
- Use semantic HTML5 tags: `<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<article>`, `<aside>`, `<form>`, `<button>`, `<ul>`, `<li>`, `<h1>-<h6>`, `<label>`, `<fieldset>`, `<legend>`
- One `<main>` element per page
- Logical heading hierarchy with only one `<h1>` per page
- Use `<nav>` for navigation, `<ul>` for lists

### Validation and Standards
- Validate HTML using https://validator.w3.org/
- Ensure all code follows W3C standards
- Use proper DOCTYPE declaration: `<!DOCTYPE html>`
- Include proper meta tags for viewport and charset

## Accessibility Requirements

### ARIA and Screen Reader Support
- Add `aria-label`, `aria-labelledby`, `aria-live`, `aria-current`, `role` attributes for interactive and navigation elements
- All interactive elements must be keyboard accessible
- All forms must have properly associated `label` and `input` elements
- All buttons must have text content or `aria-label`
- All dynamic elements must have appropriate ARIA attributes
- All tables must have headers and `scope` attributes
- All videos must have captions or text alternatives
- All audio must have text transcripts

### Skip Links and Navigation
- Add skip link at the beginning of `<body>`: `<a href="#main" class="skip-link">Skip to main content</a>`
- Ensure all navigation elements are keyboard accessible
- Use proper focus management for modals and dynamic content

### Color and Contrast
- Text and background colors must have contrast ratio of at least 4.5:1
- Test color combinations using tools like https://webaim.org/resources/contrastchecker/

## Image Requirements

### Alt Text and Descriptions
- All images must have meaningful `alt` attributes
- Use descriptive alt text that conveys the image's purpose
- For decorative images, use empty alt attribute: `alt=""`

### Image Sources and Organization
- Store all images in `assets/images/` directory
- For placeholder images, use services like:
  - https://placehold.co
  - https://placeimg.com
  - https://picsum.photos
- Optimize images for web (WebP, AVIF formats when possible)
- Specify image dimensions to prevent layout shift
- Use descriptive filenames: `hero-background.jpg`, `product-image-1.webp`

## Form Structure and Validation

### Form Elements
- Use `<label for="...">` with corresponding `id` for all form fields
- For checkbox/radio groups, use `<fieldset>` and `<legend>`
- Ensure all form inputs have proper `type` attributes
- Use `required` attribute for mandatory fields

### Form Accessibility
- All forms must be accessible without JavaScript (graceful degradation)
- Provide clear error messages and validation feedback
- Use `aria-invalid` for invalid fields
- Ensure form submission works with keyboard navigation

## Icon Implementation

### Social Media and Messenger Icons
- Store SVG icons in `assets/icons/social/` directory
- Use only inline SVG icons (do not use external CDNs, base64, or `<img>` for SVG icons)
- Example structure:
```html
<a class="header__social-link" aria-label="Instagram">
  <svg>...</svg>
</a>
```

### Other Icons
- Store UI icons in `assets/icons/ui/` directory
- Use Material Icons either as inline SVG or webfont
- For inline SVG: copy SVG code from https://fonts.google.com/icons
- For webfont: use `<span class="material-icons">icon_name</span>`
- All SVG icons must be optimized and have `aria-hidden` or `aria-label` attributes

## Modal Windows Structure

### HTML Structure
```html
<div class="modal" id="orderModal" aria-modal="true" aria-labelledby="orderModalTitle" tabindex="-1">
  <div class="modal__overlay"></div>
  <div class="modal__container">
    <button class="modal__close" aria-label="Close window" type="button">×</button>
    <h2 class="modal__title" id="orderModalTitle">Leave a request</h2>
    <form class="modal__form" id="orderForm">...</form>
    <div class="modal__thanks" id="orderThanks" hidden>Thank you! Your request has been accepted.</div>
  </div>
</div>
```

### Modal Requirements
- Unique `id` and ARIA attributes for each modal
- Proper focus management (focus on first form field when opened)
- Return focus to trigger element when closed
- Keyboard accessibility (Tab, Shift+Tab, Esc)
- Background scroll blocking when modal is open

## Responsive Menu Structure

### Mobile-First Approach
- Menu hidden on mobile, visible on desktop
- Single HTML block with different styles for different screen sizes
- No code duplication for different resolutions

### Menu Accessibility
- Use ARIA attributes: `aria-expanded`, `aria-controls`, `aria-label`
- Keyboard navigation support
- Focus management when opening/closing menu
- Close menu on outside click, Esc key, or menu link click

## SEO and Meta Tags

### Essential Meta Tags
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Page Title — Keywords, City</title>
  <meta name="description" content="Brief page description with keywords and geo-targeting." />
  <link rel="stylesheet" href="assets/css/styles.css" />
</head>
```

### Additional SEO Elements
- Open Graph meta tags for social sharing
- Structured data markup (JSON-LD)
- Unique title and description for each page
- Proper heading hierarchy for content structure

## Performance Optimization

### Loading Optimization
- Use `loading="lazy"` for images below the fold
- Minimize HTTP requests
- Use modern image formats (WebP, AVIF)
- Specify image dimensions to prevent layout shift

### Code Structure
- Single CSS file: `assets/css/styles.css`
- Single JavaScript file: `assets/js/script.js`
- All images in `assets/images/` directory
- All icons in `assets/icons/` directory (organized by type: social/, ui/)
- No inline styles or scripts
- Clean, semantic HTML structure

## Example Card Structure

### Product/Service Card
```html
<article class="window-card">
  <div class="window-card__svg">
    <!-- Window SVG icon -->
  </div>
  <div class="window-card__size">80×120 cm</div>
  <div class="window-card__content">
    <h3 class="window-card__title">Single-leaf windows</h3>
    <p class="window-card__desc">Brief description...</p>
    <button class="window-card__button" type="button">Get price</button>
  </div>
</article>
```

## Multi-page Site Structure

### Page Organization
- Consistent header/footer across all pages
- Unique meta tags for each page
- Smooth scroll for anchor links
- Template structure for reusable components

### File Structure
```
/
├── index.html (homepage)
├── about.html (about company)
├── products.html (products)
├── contacts.html (contacts)
└── assets/
    ├── css/
    │   └── styles.css
    ├── js/
    │   └── script.js
    ├── images/
    │   ├── hero-bg.jpg
    │   ├── logo.png
    │   └── ...
    └── icons/
        ├── social/
        │   ├── instagram.svg
        │   ├── facebook.svg
        │   └── ...
        └── ui/
            ├── menu.svg
            ├── close.svg
            └── ...
```

## Validation Checklist

### HTML Validation
- [ ] Valid HTML5 structure
- [ ] Proper semantic tags
- [ ] All images have alt attributes
- [ ] All forms have labels
- [ ] All interactive elements are keyboard accessible
- [ ] ARIA attributes for dynamic content
- [ ] Proper heading hierarchy
- [ ] Skip links for navigation
- [ ] Color contrast compliance
- [ ] Mobile-first responsive design
