# Talisman Vision Project Backlog

## 1. Governance Boundary
- 本バックログは `task-backlog-management` スキルを通じて管理されます。
- AC（Acceptance Criteria）には実装詳細を含めず、機能的な期待値のみを記述してください。

---

### REQ-001: プロジェクト基盤の最終調整
- **Type**: enhancement
- **Status**: done (2026-04-18)
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
- **Status**: done (2026-04-18)
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

---

### REQ-004: バックエンド接続確認の実装
- **Type**: feature
- **Status**: in-progress
- **Current step**: APIクライアントおよびサーバー状態管理ストアの実装
- **Priority**: P1
- **Surface**: Backend integration foundation.
- **Root Cause**: Backend への実際の通信を確立し、プロトタイプから連動型 UI への移行を開始するため。
- **Requirement**: 実プロセスの稼働状態を確認し、UI上に正確なステータスを表示する。
- **Acceptance criteria**:
  - サーバーが `localhost:8000` で稼働している時に「Server Online」(緑)と表示されること。
  - サーバーが停止している時に「Server Offline」(赤)と表示されること。
  - APIクライアントが `axios` で正しく構成されていること。
- **Design doc**: none

---

### REQ-005: 動画解析ワークフロー基盤の構築
- **Type**: feature
- **Status**: done (2026-04-18)
- **Current step**: none
- **Priority**: P0
- **Surface**: 解析したい動画ファイルを渡して、解析が実行されて一覧が表示される基本的なワークフローを作成したい。
- **Root Cause**: Interaction/Information Design - モック段階から実データ連携への移行に際し、動画解析のライフサイクル（登録・進捗監視・結果確認）を統合したワークフローが必要。
- **Requirement**: 動画解析タスクの「登録」「進捗監視（プログレス・プレビュー）」「解析結果（信頼度・クロップ画像含む）の確認」を一気通貫で実行できるワークフロー基盤の構築。
- **Acceptance criteria**:
  - ユーザーがローカルの動画ファイルを選択し、`/api/v1/analyze/video` 経由で解析をリクエストできること。
  - `/api/v1/analyze/status/{job_id}` を通じて進捗（プログレスバー）および最新の解析サムネイルがリアルタイムに表示されること。
  - 解析完了後、`API_CONTRACT.md` に準拠した護石データ（レア度、スキル、スロット、信頼度）と解析元クロップ画像が一覧表示されること。
  - これらの状態が Zustand のストアで管理され、画面遷移やリロードに対応していること。
- **Design doc**: [API_CONTRACT.md](file:///<PROJECT_ROOT>/mhws-vision-server/docs/system/API_CONTRACT.md)
