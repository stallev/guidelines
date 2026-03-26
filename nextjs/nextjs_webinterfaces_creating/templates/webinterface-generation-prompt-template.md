# Шаблон: prompt для генерации premium `.pen` дизайна

## Как использовать

1. Заполните все блоки ниже без пропусков.
2. Передайте шаблон в AI как единый prompt.
3. Требуйте строго структурированный output по разделам.

## Prompt template

```md
You are a Senior Product Designer + Senior UX Architect for premium web interfaces.
Create a production-ready `.pen` design specification for a Next.js 16+ web page.

## Project context
- Product:
- Business goal:
- Target audience:
- Core user jobs:
- Primary CTA:
- Secondary CTA:

## Constraints
- Stack alignment: Next.js 16+, TypeScript, Tailwind v4, shadcn/ui.
- Must support breakpoints: mobile, tablet, desktop.
- Use wireframes as structural source of truth.
- Follow FAANG-level UX/UI principles:
  - predictability and consistency
  - visual hierarchy and scanability
  - progressive disclosure
  - production states (empty/loading/error/forbidden)
  - accessibility (WCAG 2.x level)
  - trust/privacy patterns
- Motion must be professional and performance-safe.
- Must support prefers-reduced-motion.

## Inputs
- IA summary:
- User flow for this page:
- Wireframe regions (mobile/tablet/desktop):
- Content blocks with priorities:
- Required components:
- Data dependencies (static/dynamic/personalized):
- Risky UX points:

## Required output format
Return ONLY these sections:

1) Page blueprint
- Page purpose
- Success criteria
- Region map (header/body/footer/aside/overlays)

2) Breakpoint specs
- Mobile layout
- Tablet layout
- Desktop layout
- Region behavior differences by breakpoint

3) Component inventory and mapping
- Atoms
- Molecules
- Organisms
- Template composition
- Mapping to expected implementation components

4) State matrix
- empty/loading/error/forbidden/success (if applicable)
- Form states, nav states, modal states, notification states

5) Design token pack
- Typography scale
- Color tokens (brand/surface/text/border/semantic)
- Spacing/radius/shadow/elevation
- Motion tokens (duration/easing)

6) Motion and microinteractions
- Motion purpose by region
- Entry/exit interactions
- Feedback animations for controls
- Reduced-motion fallback behavior
- Performance constraints (avoid heavy layout animations)

7) Accessibility checklist
- Focus order
- Keyboard interactions
- Labels and semantics
- Contrast and readability checks

8) Handoff checklist
- `.pen` node naming convention
- Ready-for-dev criteria
- Risks and open questions

## Acceptance criteria
- Premium visual hierarchy and consistent interaction language.
- No ambiguous states.
- Wireframe structure preserved.
- Ready for 1:1 Next.js implementation.
- Prepared for PageSpeed green-zone targets.
```
