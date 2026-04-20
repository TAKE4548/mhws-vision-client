---
name: frontend-conventions
description: "Specialized Frontend conventions for React, Vite, and Tailwind."
 ---
# Frontend Conventions (React & Vite)

This document defines specialized technical standards for the frontend repository.

## 1. React & Vite
- **Function Components**: Use modern functional components with hooks.
- **Vite optimization**: Ensure all assets are handled via Vite's `import` system for proper bundling.
- **Component Anatomy**: Separate business logic (hooks) from presentational components.

## 2. State & Styling
- **Zustand**: Keep a single global store for talisman data and analysis status.
- **Tailwind CSS**: Exclusively use utility classes or `@apply` in `index.css`. No inline styles.
- **Design Integrity**: 
  - Refer to `docs/ui/features/DESIGN_SYSTEM.md` for color/spacing tokens.
  - Refer to `docs/ui/specs/` (APP-STRUCTURE.md, SPEC.md, FLOW-TRANSITION.md) for UI architecture and component specifications.

## 3. Stitch/AI Integration
- When using Stitch-generated code, normalize it to match project-standard TypeScript interfaces and Tailwind tokens.
- Ensure all interactive elements have unique IDs for stability during automated testing.
