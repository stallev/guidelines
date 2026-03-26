# Admin Interface Requirements (AI Agent)

## Document Version: 1.0
**Creation Date:** February 2026  
**Scope:** reusable guideline for admin interfaces in Next.js projects  
**Applies to:** Admin dashboard pages and forms

---

## 1. Overview

This document defines layout and styling requirements for the admin panel UI so that forms and controls are consistent, readable, and follow best practices. Apply these rules when creating or editing admin pages and form components.

---

## 2. Buttons

- **Width:** Buttons should be sized by their content, not stretched to the full width of the container.
- **Implementation:** Use `w-auto` or rely on default `inline-flex` behavior. Do **not** use `w-full` on action buttons (e.g. Submit, Cancel, Add, Edit, Delete) unless a full-width button is explicitly required (e.g. primary submit in a narrow modal).
- **Groups:** Button groups should use `flex flex-wrap gap-2` (or similar) so buttons wrap on small screens and do not force a single full-width row.

---

## 3. Input Fields

### 3.1. Short / Unformatted Text Inputs

- **Max width:** Inputs for short, unformatted text (name, slug, email, phone, price, unit, etc.) should have a **maximum width of 300px**.
- **Layout:** Place fields in a grid or flex layout with `flex-wrap` so that multiple fields can sit side-by-side where appropriate and wrap on smaller screens (e.g. `grid grid-cols-1 gap-4 sm:grid-cols-2` or `flex flex-wrap gap-4`).
- **Implementation:** Wrap the input (or FormItem) in a container with `max-w-[300px]` or use a shared class. Avoid inputs that span the entire form width unless the field is meant for long content.

### 3.2. Long / Description Fields

- **Max width:** Fields used for longer or multi-line content (e.g. description, full description, bio, story text) may use a **maximum width of 650px** so that line length remains readable.
- **Implementation:** Use `max-w-[650px]` (or equivalent) on the wrapper for textarea/description-style fields.

---

## 4. Form Layout

- **Consistency:** Use consistent spacing (e.g. `space-y-4` or `space-y-6` between sections).
- **Grouping:** Group related fields visually (e.g. price from/to/unit in one row or block).
- **Labels and alignment:** Keep label and input alignment consistent; use the same form primitive (e.g. FormLabel + FormControl) across admin forms.

---

## 5. Summary

| Element              | Rule                                      |
|----------------------|-------------------------------------------|
| Buttons              | Width by content (`w-auto` / no `w-full`) |
| Short text inputs    | Max width 300px, grid/flex with wrap      |
| Description / long  | Max width 650px                           |
| Button groups        | `flex flex-wrap gap-2`                    |

Apply these requirements when building or refactoring admin dashboard pages and form components (e.g. ServiceForm, FAQForm, CompanyForm, TeamMemberForm, Service Category form).
