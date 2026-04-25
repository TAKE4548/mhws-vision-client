---
name: role-ux-designer
description: "Extended UX designer skill for Frontend context (Modularity & States)."
---
# UX Designer (Frontend Extension)

This skill extends the global AntiGravity UX protocol with repository-specific frontend requirements.

## 1. Global Baseline
For core principles and process flows, refer to the global definition:
file:///<USER_HOME>/.gemini/antigravity/skills/role-ux-designer/SKILL.md

## 2. Frontend Specific Protocols

### [MUST [F-UX-01]] Atomic & Modular Design
When proposing UI changes, the agent MUST prioritize component modularity.
- **Action**: Break down complex views into reusable atoms/molecules.
- **Reasoning**: To ensure consistency and reduce CSS/JS payload.

### [MUST [F-UX-02]] Mandatory "Non-Ideal State" Definitions
Every new feature or major view enhancement MUST include explicit definitions and implementations for the following states:
1. **Loading State**: Visual feedback during async data fetching (Skeleton, Spinner).
2. **Error State**: User-friendly messaging and recovery actions for API failures.
3. **Empty State**: Guidance or placeholder when no data (e.g., "No Talismans Found") is present.

### [MUST [F-UX-03]] Design System Alignment
Always cross-reference `docs/ui/features/DESIGN_SYSTEM.md`. If a design proposal deviates from the established system, the agent MUST identify this as a "Professional Dissent" and seek user approval.

## 3. Hybrid Orchestration (Local Expert)
- Use `python ${GLOBAL_SCRIPTS}\ollama_adapter.py sync-docs` to master current UI rules.
- Use `ux-audit` to audit existing CSS/Components for token compliance using the local model.
