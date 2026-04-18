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
- **Status**: done (2026-04-18)
- **Current step**: none
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

---

### REQ-006: ダッシュボード・リデザイン（一望性と操作性の向上）
- **Type**: refinement
- **Status**: done (2026-04-18)
- **Current step**: none
- **Priority**: P1
- **Surface**: SPEC準拠の情報配置、Bentoスタイル統計パネル、可変サイドバーの実装を通じた操作性の向上。
- **Root Cause**: Information Design / Interaction - 解析結果の全体把握（クロップ画像含む）と、個別の詳細確認・修正フローにおける視覚的・操作的摩擦の解消。
- **Requirement**: Stitchプロジェクト『Markdown-Driven React UI』のコンセプトに基づき、高密度な情報レイアウトと、シームレスな詳細レビュー（マニュアルオーバーライド）を実現する。
- **Acceptance criteria**:
  - `Vision Engine Dashboard (v6)` に基づく、解析進捗と結果の一覧性が高いグリッド/リストレイアウトが実装されていること
  - 護石カードをクリックした際、`Manual Override Modal` に基づく詳細確認・修正用モーダルが表示されること
  - 各護石データに紐づくクロップ画像が、レビューに適したサイズとアスペクト比で表示されること
  - モーダル内での修正内容が Zustand ストアに反映され、一覧画面に即座に同期されること
---

### REQ-007: ROI設定用 Canvas インタラクション
- **Type**: feature
- **Status**: new
- **Current step**: none
- **Priority**: P0
- **Surface**: キャンバス上での矩形選択、ドラッグ、リサイズ機能の実装。
- **Root Cause**: Interaction Design - 座標の数値入力だけでなく、視覚的操作により直感的な解析範囲設定が必要。
- **Requirement**: Canvas API またはライブラリを用い、ROI（解析矩形）をユーザーが画面上でインタラクティブに変更・リサイズ・保存できるUIを提供する。
- **Acceptance criteria**:
  - 画像または動画プレビュー上で矩形を描画・変更できること。
  - 矩形の各辺・角に制御ハンドルが表示され、リサイズが可能であること。
  - 決定された座標データが Zustand ストアに保存され、Backend API と連携可能な形式で保持されること。
- **Design doc**: none

---

### REQ-008: 高機能ジョブ・モニターダッシュボード
- **Type**: feature
- **Status**: new
- **Current step**: none
- **Priority**: P2
- **Surface**: 複数ジョブのステータス一覧、フィルタリング、進捗の動的表示。
- **Root Cause**: Information Design - 複数の動画を並列処理する際、各タスクの状況を俯瞰して把握し、エラー発生時に迅速に対処するため。
- **Requirement**: 過去・現在の解析ジョブを一元管理するダッシュボード。進捗率の動的更新、成功・失敗・処理中のステータスフィルタリング機能を備える。
- **Acceptance criteria**:
  - ジョブ一覧がテーブルまたはグリッド形式で表示されること。
  - 進捗がリアルタイム（ポーリング等）で更新され、MHW風のプログレスバーで視覚化されること。
  - 各ジョブから詳細結果画面（護石一覧）へ遷移できること。
- **Design doc**: none

---

### REQ-009: プレミアム護石カード（MHW HUDスタイル）
- **Type**: refinement
- **Status**: new
- **Current step**: none
- **Priority**: P1
- **Surface**: レア度に応じた視覚効果、バッジ表示、スロット情報の完全同期。
- **Root Cause**: Aesthetics / Information Design - 解析結果の重要度（レア度や信頼度）を一目で判断できるようにし、ゲーム本編に近い没入感を提供するため。
- **Requirement**: `DESIGN_SYSTEM.md` に基づき、護石カードのデザインをブラッシュアップ。レア度に応じた配色、装飾品スロットの正確なアイコン表現、OCR信頼度に基づく「要確認」バッジ等を実装する。
- **Acceptance criteria**:
  - レア度(Rarity)に応じた枠線色やグラデーションが適用されていること。
  - スロット（Lv1〜4）がゲーム内アイコンに近い形式で表示されること。
  - OCR信頼度が閾値以下の項目に対し「Caution/High Confidence」等のラベルが表示されること。
- **Design doc**: [DESIGN_SYSTEM.md](file:///c:/Users/audih/ws/hogehoge/mhws-vision-client/docs/ui/features/DESIGN_SYSTEM.md)

---

### REQ-010: マスターデータ連携型修正モーダル
- **Type**: feature
- **Status**: new
- **Current step**: none
- **Priority**: P2
- **Surface**: スキル名のオートコンプリート、バリデーション付き修正インターフェース。
- **Root Cause**: Efficiency / Data Integrity - 手動修正時の入力ミスを最小限に抑え、存在しないスキル名の登録を防止するため。
- **Requirement**: 護石データ修正モーダルにおいて、スキル名入力時に静的マスターデータから候補を表示する。また、スロットやレベルの入力範囲をバリデーションする機能を実装する。
- **Acceptance criteria**:
  - スキル名入力欄で部分一致によるオートコンプリートが動作すること。
  - 選択肢にないスキル名が入力された場合に警告または入力を制限すること。
  - 修正完了時、`PATCH /api/v1/talismans/{id}` へのリクエストが正しく発行されること。
- **Design doc**: none

