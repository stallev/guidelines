# Task Execution Workflow PRD: "Behold Your God" Platform

This Product Requirements Document (PRD) defines the structured workflow for the CursorAI agent when executing development tasks for the "Behold Your God" God-centered content platform. The workflow ensures high-quality code, compliance with project standards, and alignment with the Feature-Sliced Design (FSD) + Atomic Design architecture, TypeScript requirements, and project documentation as specified in the Master Architecture Guideline v3.0.

---

## Purpose

The Task Execution Workflow ensures that all development tasks are performed systematically, with rigorous validation and documentation to maintain code quality, consistency, and adherence to the "Behold Your God" project requirements. This workflow is mandatory for the CursorAI agent to follow for every task, ensuring compliance with the Master Architecture Guideline v3.0 and AWS Amplify infrastructure.

---

## Task Execution Workflow

The CursorAI agent must follow the steps below for each development task to ensure compliance with the project's technical, functional, and design requirements.

### Step 1: Task Analysis
- **Objective**: Understand the task requirements and align with Master Architecture Guideline v3.0.
- **Actions**:
  - Review the task description and cross-reference with relevant sections in:
    - [`docs/arc_docs/master_architecture_guideline.md`](docs/arc_docs/master_architecture_guideline.md) (single source of truth for architecture).
    - [`docs/arc_docs/architectecture_concept.md`](docs/arc_docs/architectecture_concept.md) (AWS infrastructure design).
    - [`docs/current_project_files_tree.md`](docs/current_project_files_tree.md) (current project structure).
    - [`docs/develop_plan.md`](docs/develop_plan.md) (development phases and priorities).
    - Specialized guidelines in [`docs/arc_docs/guidelines/`](docs/arc_docs/guidelines/) for specific patterns.
  - Identify the appropriate FSD layer (`pages`, `widgets`, `features`, `entities`, `shared`) and segment (`ui`, `model`, `lib`) for the task.
  - Determine if the task requires Server Components (default) or Client Components (interactivity only).
  - Check if the task involves AWS Amplify services (AppSync, DynamoDB, Cognito, S3).
  The document must include:
    - Step-by-step implementation instructions in English.
    - Code examples with explanations following FSD + Atomic Design patterns.
    - References to Master Architecture Guideline and specialized guidelines.
    - FSD architecture compliance details (layer dependencies, public APIs).
    - Alternative implementation approaches with pros and cons.
    - Justification for the chosen approach.
    - Dependencies on other tasks or AWS services.

### Step 2: Code Implementation
- **Objective**: Implement the task following Master Architecture Guideline v3.0 and AWS Amplify best practices.
- **Actions**:
  - Place code in the appropriate FSD layer and segment according to Master Architecture Guideline:
    - **`shared/`**: Global, framework-agnostic code (UI atoms, utilities, constants)
    - **`entities/`**: Domain models (Post, User, Category, MediaAsset) with types and schemas
    - **`features/`**: User actions (auth, post-creation, post-publish) with Server Actions
    - **`widgets/`**: Complex UI blocks (header, footer, post-card) for composition
    - **`pages/`**: Next.js App Router pages (orchestration only)
  - Adhere to strict TypeScript typing, prohibiting the use of `any` types. Define specific types in `entities/{name}/model/types.ts` or `features/{name}/model/types.ts`.
  - Use **Zod schemas as single source of truth** for validation. Derive TypeScript types using `z.infer<typeof Schema>`.
  - Implement **Server Components by default**. Add `'use client'` only when interactivity is required (useState, useEffect, event handlers).
  - For Server Actions, follow [`ai_server_actions_guidelines.md`](docs/arc_docs/guidelines/ai_server_actions_guidelines.md):
    - Place in `features/{name}/model/{actionName}Action.ts` or `entities/{name}/model/{actionName}Action.ts`
    - Include `'use server'` directive
    - Authentication check using Cognito (AWS Amplify)
    - Authorization check for RBAC (Admin, Editor, Moderator roles)
    - Input validation using Zod schemas
    - Business logic execution (AppSync mutations, S3 operations)
    - Sanitization using `DOMPurify` for rich text content
    - Return discriminated unions: `{ success: true } | { success: false, error: string }`
  - For UI components, follow [`ai_component_guidelines.md`](docs/arc_docs/guidelines/ai_component_guidelines.md):
    - Use `shadcn/ui` components from `shared/ui/atoms/`
    - Apply Atomic Design hierarchy: Atoms → Molecules → Organisms
    - Use Tailwind CSS 4 with semantic classes and `@theme` directive
    - Ensure WCAG 2.1 AA accessibility (keyboard navigation, ARIA labels, 4.5:1 contrast)
  - For React hooks, follow [`ai_react_hooks_guidelines.md`](docs/arc_docs/guidelines/ai_react_hooks_guidelines.md):
    - Place in `model/` directories only (never in `shared/`)
    - Use React Query for Admin Panel data management
    - Use Server Components for public pages (no hooks needed)
  - For utility functions, follow [`ai_react_utilities_guidelines.md`](docs/arc_docs/guidelines/ai_react_utilities_guidelines.md):
    - Place in `shared/lib/` for global utilities
    - Ensure pure functions (no side effects)
    - Use named exports for tree-shaking
  - Add English-only code comments with JSDoc for complex logic.

### Step 3: TypeScript Validation
- **Objective**: Ensure type safety and eliminate TypeScript errors according to Master Architecture Guideline.
- **Actions**:
  - Run `npx tsc --noEmit` to check for TypeScript errors. Use this command at this step.
  - If errors are detected (e.g., `Unexpected any`, missing types, FSD violations):
    - Fix errors by defining specific types in the appropriate `entities/{name}/model/types.ts` or `features/{name}/model/types.ts` file.
    - Ensure all types follow [`ai_react_types_guidelines.md`](docs/arc_docs/guidelines/ai_react_types_guidelines.md) patterns.
    - Use `z.infer<typeof Schema>` for types derived from Zod schemas.
    - Re-run `npx tsc --noEmit` until no errors remain.
  - Document any type-related fixes in the task description document.

### Step 4: Linting
- **Objective**: Ensure code adheres to linting standards and FSD architecture rules.
- **Actions**:
  - Run `npm run lint:fix` to detect and fix linting issues, including warnings like `Unexpected any. Specify a different type`.
  - If issues are detected:
    - Address each issue (e.g., replace `any` with specific types, fix formatting, resolve FSD violations).
    - Ensure FSD layer dependencies are correct (no upward imports).
    - Re-run `npm run lint:fix` until no issues remain.
  - Ensure all code complies with ESLint, Prettier, and FSD architecture standards.

### Step 5: Build Validation
- **Objective**: Verify that the project builds successfully without errors, including AWS Amplify compatibility.
- **Actions**:
  - Run `npm run build` to check for build errors.
  - If errors are detected (e.g., missing imports, incorrect configurations, AWS Amplify issues):
    - Fix the errors and document the fixes.
    - Ensure all imports follow FSD layer rules.
    - Verify AWS Amplify configuration is correct.
    - Re-run `npm run build` until the build succeeds.
  - Document any build-related fixes in the task description document.

### Step 6: Code Review Simulation
- **Objective**: Ensure code quality and compliance with Master Architecture Guideline through self-review.
- **Actions**:
  - Simulate a code review by checking for:
    - **FSD Architecture Compliance**: Layer separation, import rules, public APIs via `index.ts` barrel files.
    - **TypeScript Requirements**: Strict typing, Zod schemas as single source of truth, `z.infer<typeof Schema>`.
    - **Server Actions**: `'use server'` directive, Cognito auth, Zod validation, DOMPurify sanitization, discriminated unions.
    - **Component Architecture**: Server Components by default, Client Components only for interactivity, Atomic Design hierarchy.
    - **AWS Amplify Integration**: Proper AppSync usage, DynamoDB operations, S3 presigned URLs, Cognito RBAC.
    - **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, ARIA labels, 4.5:1 color contrast.
    - **Performance**: SSG/ISR for public pages, React Query for Admin Panel, dynamic imports for heavy components.
    - **Security**: Input validation, output sanitization, RBAC enforcement, error handling.
    - **Code Quality**: Clear JSDoc comments, consistent naming, proper error handling.
  - If issues are found, revise the code and repeat Steps 3–5 as needed.
  - Document any revisions in the task description document.

### Step 7: Documentation Update
- **Objective**: Ensure comprehensive documentation of the task according to Master Architecture Guideline.
- **Actions**:
  - Update or finalize the task description document with:
    - Detailed implementation steps following FSD + Atomic Design patterns.
    - Code examples with explanations, demonstrating proper layer placement and AWS Amplify integration.
    - Validation outcomes (TypeScript, linting, build, FSD compliance).
    - Any deviations from the planned approach and their justification.
    - Dependencies on other tasks or AWS services.
    - References to relevant specialized guidelines used.
  - If the task affects the project structure, update [`docs/current_project_files_tree.md`](docs/current_project_files_tree.md).
  - If the task involves AWS Amplify schema changes, update `amplify/backend/api/beholdyourgod/schema.graphql` and document in relevant spec files.
  - If the task affects the development plan, update [`docs/develop_plan.md`](docs/develop_plan.md).
  - Ensure all documentation and code comments are in English.

---

## Success Metrics

- **Code Quality**:
  - Zero TypeScript errors (`npx tsc --noEmit`).
  - Zero linting issues (`npm run lint:fix`).
  - Successful builds (`npm run build`).
  - FSD architecture compliance (no upward imports, proper layer placement).
- **Architecture Compliance**:
  - Master Architecture Guideline v3.0 adherence.
  - AWS Amplify integration (AppSync, DynamoDB, Cognito, S3).
  - Server Components by default, Client Components only when needed.
  - Zod schemas as single source of truth for validation.
- **Documentation**: Task description document is complete, in English, and includes all required sections with references to specialized guidelines.

---

## Error Handling and Recovery

- **Error Handling**:
  - Implement comprehensive error handling in Server Actions with user-friendly messages.
  - Use discriminated unions for error responses: `{ success: false, error: string }`.
  - Log errors to CloudWatch (AWS Amplify) for production debugging.
  - Sanitize all user inputs using DOMPurify for rich text content.
  - Return meaningful error responses to the client with proper HTTP status codes.
- **Recovery Procedures**:
  - If TypeScript, linting, or build errors persist after multiple attempts:
    - Revert to the last known working state using git.
    - Document the issue and resolution attempts in the task description document.
    - Check Master Architecture Guideline for alternative implementation approaches.
    - Consult specialized guidelines for specific patterns (components, hooks, types, etc.).

---

## Example Task Execution

**Task**: Implement the post creation form in the Admin Panel.

**Workflow**:
1. **Task Analysis**:
   - Review [`docs/arc_docs/master_architecture_guideline.md`](docs/arc_docs/master_architecture_guideline.md) for FSD layer placement.
   - Check [`docs/current_project_files_tree.md`](docs/current_project_files_tree.md) for current structure.
   - Identify this as a `features/post-creation/` task requiring Server Actions and Admin Panel UI.
   - Reference [`docs/arc_docs/guidelines/ai_server_actions_guidelines.md`](docs/arc_docs/guidelines/ai_server_actions_guidelines.md) for Server Action patterns.

2. **Code Implementation**:
   - Create `src/features/post-creation/ui/PostCreateForm.tsx` using `shadcn/ui` components and Tailwind CSS 4.
   - Implement `src/features/post-creation/model/createPostAction.ts` with:
     - `'use server'` directive
     - Cognito authentication check
     - Zod validation using `CreatePostSchema` from `entities/post/model/post.schema.ts`
     - DOMPurify sanitization for rich text content
     - AppSync mutation for DynamoDB storage
     - Discriminated union return type
   - Define types in `src/features/post-creation/model/types.ts` using `z.infer<typeof Schema>`.
   - Use React Query for Admin Panel state management.

3. **TypeScript Validation**:
   - Run `npx tsc --noEmit` and fix any type errors.
   - Ensure all types follow [`ai_react_types_guidelines.md`](docs/arc_docs/guidelines/ai_react_types_guidelines.md) patterns.
   - Re-run until no errors remain.

4. **Linting**:
   - Run `npm run lint:fix` and resolve any issues.
   - Ensure FSD layer dependencies are correct (no upward imports).
   - Re-run until no issues remain.

5. **Build Validation**:
   - Run `npm run build` and fix any build errors.
   - Verify AWS Amplify configuration is correct.
   - Re-run until the build succeeds.

6. **Code Review Simulation**:
   - Verify FSD compliance, Server Action patterns, AWS Amplify integration, and accessibility.
   - Check WCAG 2.1 AA compliance for form inputs.
   - Revise code if issues are found and repeat Steps 3–5.

7. **Documentation Update**:
   - Update task documentation with implementation details and AWS Amplify integration.
   - Update [`docs/current_project_files_tree.md`](docs/current_project_files_tree.md) if new files are added.

---

**Document Version**: 2.0  
**Last Updated**: October 6, 2025  
**Next Review**: October 20, 2025  
**Architecture Version**: Master Architecture Guideline v3.0  
**Project**: "Behold Your God" - God-Centered Content Platform