# Project AntiGravity: Talisman Vision - FRONTEND

## Core Values
1. **Design System Strictness**: All UI must comply with `docs/ui/features/DESIGN_SYSTEM.md`.
2. **State Centralization**: Use Zustand for global state. Avoid component-local state for shared talisman data.
3. **Type Safety**: No `any` types. Ensure full TypeScript coverage for API responses.

## Project Metadata
- **Purpose**: High-precision UI for Talisman review and ROI calibration.
- **Technology Stack**: React (Vite), TypeScript, Tailwind CSS, Zustand.
- **Operational Rule**: Follow standard AntiGravity workflows (dev, bug, etc.).
- **UI Architecture & Spec SSoT**: `docs/ui/specs/`
  - `APP-STRUCTURE.md`: アプリ全体の技術スタック、擬似ルーティング、階層構造。
  - `SPEC.md`: コンポーネント単位の視覚定義、レスポンシブ、状態UI仕様。
  - `FLOW-TRANSITION.md`: Mermaid による遷移図、インタラクションロジック、状態遷移表。
- **Backlog SSoT**: `docs/backlog/`
  - `INDEX.md`: 要件一覧とステータス管理。
  - `pbi/`: 各要件の詳細定義。
  - `task/`: 各要件に紐づくタスク分解。
- **System Design SSoT**: `../mhws-vision-server/docs/system`
  - 全ての API 仕様、シーケンス、システム要件の正解は隣接する Server リポジトリ内の上記ディレクトリに存在します。
- **Repository Layout**: Client と Server リポジトリは同一の親ディレクトリ下に隣接して配置されている必要があります。

## Special Skills
- **frontend-conventions**: Mandatory for all UI development tasks.
- **task-interface-audit**: Mandatory for aligning with Backend API schemas.
