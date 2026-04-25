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

## 3. Token Efficiency Protocols (Anti-Dilution)

### [MUST [F-T-01]] Script-First Discovery
To minimize context dilution, agents MUST prioritize using global scripts for information gathering:
- **UI Impact Analysis**: Use `python ${GLOBAL_SCRIPTS}\doc_mapper.py` to identify related documentation.
- **Code Search**: Use `python ${GLOBAL_SCRIPTS}\code_analyzer.py` for symbol lookup before broad grepping.

### [MUST [F-T-02]] Hermetic Implementation (Task Card Compliance)
During the `/dev-task` phase, the Engineer role MUST rely strictly on the `task.md` (Task Card) generated in `/dev-design`.
- **[必須] コンテキスト分離**: タスクカードに記載された情報のみを前提とし、過去の履歴や広範な探索を排除する。
- **[必須] 物理的制限**: タスクカードにスニペット（### 2.1, 2.2）がある場合、対象ファイルの全体読み込み（`read_file`）を禁止する。

### [MUST [F-T-04]] Executable Verification Gate
Before issuing a PASS verdict, the agent MUST execute the CLI commands and browser assertions defined in the `test-plan.md`.
- **Assertion**: Must use specific ID selectors (e.g., `#analysis-status-ready`) to verify UI states.
- **Audit**: Must run `python ${GLOBAL_SCRIPTS}\ollama_adapter.py qa-audit` for the test plan.

### [MUST [F-T-03]] Local-First Pre-Processing
Any raw data (terminal output, logs, or file contents) exceeding 50 lines MUST be summarized using the local model (Ollama) before being processed by the cloud model.
- **Command**: `python ${GLOBAL_SCRIPTS}\ollama_adapter.py summarize`
