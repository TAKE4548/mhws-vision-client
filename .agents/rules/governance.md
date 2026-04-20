# Governance (Frontend Local Constitution)

This document defines repository-specific constraints for the frontend application, extending the global AntiGravity constitution.

## 1. Global Alignment
All actions must comply with the global rules defined here:
file:///<USER_HOME>/.gemini/antigravity/governance/GEMINI.md

## 2. Frontend Constraints (Local)

### [MUST [F-01]] Port Constraint
The local development server MUST run on **localhost:5173**. Agents should prioritize verifying availability at this port before reporting failure.

### [MUST [F-02]] Design Token Compliance
Direct use of hex codes or hardcoded color/spacing values in React components or Tailwind classes is PROHIBITED.
- **Reference**: `src/index.css`
- **Action**: Use the predefined CSS variables or Tailwind utility classes derived from the MHW Design System.

### [MUST [F-03]] Mock-First Development
If the Backend API (`localhost:8000`) is unavailable or lacking specific endpoints, the agent MUST implement/utilize mock data (via MSW or local JSON) to ensure frontend development progress.

### [MUST [F-04]] Dynamic Responsive Audit
Before completing any UI task, the agent MUST verify layout stability across multiple viewport sizes (Mobile, Tablet, Desktop) using the browser sub-agent.

### [MUST [F-05]] UI Specification SSoT Compliance
Any modification to high-level UI structure, components, or user flows MUST follow these steps:
1. **Validation**: Read `docs/ui/specs/` to verify alignment with existing architecture.
2. **Implementation**: Execute changes following the established specs.
3. **Synchronization**: Update the relevant files in `docs/ui/specs/` (APP-STRUCTURE.md, SPEC.md, or FLOW-TRANSITION.md) to reflect the new state.
