# Project AntiGravity: Talisman Vision - FRONTEND

## Core Values
1. **Design System Strictness**: All UI must comply with `docs/ui/features/DESIGN_SYSTEM.md`.
2. **State Centralization**: Use Zustand for global state. Avoid component-local state for shared talisman data.
3. **Type Safety**: No `any` types. Ensure full TypeScript coverage for API responses.

## Project Metadata
- **Purpose**: High-precision UI for Talisman review and ROI calibration.
- **Technology Stack**: React (Vite), TypeScript, Tailwind CSS, Zustand.
- **Operational Rule**: Follow standard AntiGravity workflows (dev, bug, etc.).
- **System Design SSoT**: `../mhws-vision-server/docs/system`
  - 全ての API 仕様、シーケンス、システム要件の正解は隣接する Server リポジトリ内の上記ディレクトリに存在します。
- **Repository Layout**: Client と Server リポジトリは同一の親ディレクトリ下に隣接して配置されている必要があります。

## Special Skills
- **frontend-conventions**: Mandatory for all UI development tasks.
- **task-interface-audit**: Mandatory for aligning with Backend API schemas.
