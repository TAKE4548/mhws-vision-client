# [MASTER GUIDE] Frontend Development Main Flow

本ドキュメントは、フロントエンド（Vite + React）の開発を担当するエージェント向けのマスターガイドです。

## [Role Requirement]
- **Role**: `role-ux-designer` (Frontend Expert)
- **Scope**: `tmp/frontend/src/`, `tmp/frontend/docs/ui/`
- **Forbidden**: バックエンドのロジック（`tmp/backend/`）を直接編集すること。

---

## 開発ステップ

### Step 1: デザインシステムと定数の定義
- **参照**: `docs/ui/features/DESIGN_SYSTEM.md`
- **作業**: Tailwind CSS のテーマ設定、共通カラー、フォントの設定。
- **目的**: プロジェクト全体で一貫した「MHWスタイル」を維持する。

### Step 2: ステート管理の構築
- **参照**: `docs/ui/features/REVIEW_DASHBOARD.md`
- **作業**: Zustand を用いたグローバルステートの定義。
- **目的**: 複雑な護石データのリスト、フィルタリング、抽出進捗を一元管理する。

### Step 3: API クライアントの実装
- **参照**: `backend/docs/system/API_CONTRACT.md` (※BEドキュメントを参照すること)
- **作業**: Fetch/Axios クライアントの作成、TypeScript 型定義の生成。

### Step 4: 各画面・インタラクションの実装
- **参照**: `docs/ui/features/ROI_CALIBRATOR.md`
- **作業**: 解析範囲設定 UI、レビューグリッドの実装。

---

## 完了定義 (Definition of Done)
- [ ] すべてのコンポーネントがレスポンシブであり、`DESIGN_SYSTEM.md` のトークンに従っていること。
- [ ] バックエンド API との型同期が取れ、正常にデータ表示・更新ができること。
- [ ] 解析中の進捗表示がリアルタイムに行われること。
