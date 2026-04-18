# Talisman Vision Project Backlog

## 1. Governance Boundary
- 本バックログは `task-backlog-management` スキルを通じて管理されます。
- AC（Acceptance Criteria）には実装詳細を含めず、機能的な期待値のみを記述してください。

---

### REQ-001: プロジェクト基盤の最終調整
- **Type**: enhancement
- **Status**: done
- **Current step**: none
- **Priority**: P3
- **Surface**: 初期環境構築後の細かな構成確認とクリーンアップ。
- **Root Cause**: 自動生成ファイルやプレースホルダーコードの整理が必要。
- **Requirement**: 開発者が迷いなく開発を開始できるレベルまでリポジトリの状態を磨き上げる。
- **Acceptance criteria**:
  - `npm run dev` でエラーなく初期画面が表示されること
  - 既存の `src` 配下の空ディレクトリに必要な `.gitkeep` 等が配置されているか、不要なら削除されていること
  - `README.md` にプロジェクトの概要と起動方法が記載されていること
- **Design doc**: none

---

### REQ-003: フロントエンド初版画面プロトタイプの作成
- **Type**: feature
- **Status**: done
- **Current step**: none
- **Priority**: P1
- **Surface**: docs 内の設計に基づき、MHW スタイルの高精度なUIプロトタイプを構築したい。
- **Root Cause**: Interaction/Information Design - Streamlit の制約を超えた、高精度な操作性と視覚的な一貫性（HUDスタイル）を実現するため。
- **Requirement**: Backend 移行と並行して、Mock データを用いた主要機能（Dashboard, ROI Calibrator）の画面構造とデザインシステムを先行して実装する。
- **Acceptance criteria**:
  - `DESIGN_SYSTEM.md` に基づく共通レイアウト（MHWスタイル）が Tailwind CSS で実装されていること
  - 「Review Dashboard」と「ROI Calibrator」の画面がサイドバー等で切り替え可能であること
  - 各画面がモックデータを使用し、設計通りのコンポーネント構成で表示されること
  - Zustand を用いたステート管理の初期構造（ストア定義）が完了していること
- **Design doc**: [DESIGN_SYSTEM.md](file:///c:/Users/audih/ws/hogehoge/mhws-vision-client/docs/ui/features/DESIGN_SYSTEM.md), [REVIEW_DASHBOARD.md](file:///c:/Users/audih/ws/hogehoge/mhws-vision-client/docs/ui/features/REVIEW_DASHBOARD.md), [ROI_CALIBRATOR.md](file:///c:/Users/audih/ws/hogehoge/mhws-vision-client/docs/ui/features/ROI_CALIBRATOR.md)
