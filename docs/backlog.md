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
- **Requirement**: 動画解析タスク의「登録」「進捗監視（プログレス・プレビュー）」「解析結果（信頼度・クロップ画像含む）の確認」を一気通貫で実行できるワークフロー基盤の構築。
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
- **Status**: done (2026-04-19)
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

---


### REQ-013: 階層型ROIキャリブレーション・ワークフローの統合
- **Type**: feature
- **Status**: done (2026-04-19)
- **Current step**: none
- **Priority**: P0
- **Surface**: Streamlit版からの移行で未完成だったROI設定フローを、設計書に基づきユーザーが実際に使用可能なレベルで実装したい。
- **Root Cause**: Interaction Design / Information Design - 単一の矩形操作のみの現状では、解像度や録画環境の違いに対応するための詳細な項目別設定や色正規化が行えず、認識精度の担保が困難。
- **Requirement**: `01_roi_setup.md` および `01_roi_setup_api.md` に基づき、親ROI・子ROI・色の正規化ポイントを段階的に設定・プレビューし、プロファイルとして保存できる一連のワークフローの構築。
- **Acceptance criteria**:
  - ✅ 階層型キャリブレーション（全体枠の指定 → 各項目の詳細指定 → 色の正規化）がガイド付きUIで実行できること。
  - ✅ `GET /api/v1/vision/preview` を介して、現在設定中の範囲のプレビュー画像が即座に同期されること。
  - ✅ 数値入力 & ±ボタンによる1px単位の微調整インタラクションが含まれること。
  - ✅ 背景色・枠色の正規化ポイントをスポイト（十字レティクルUI）で指定できること。
  - ✅ 最終的な設定値をプロファイル名と共に `POST /api/v1/config/roi/profiles` へ送信・保存できること。
  - ✅ スタブモードで一連のシーケンスが動作し、期待されるデータが送信されることを確認済み。
- **Design doc**: [01_roi_setup.md](file:///c:/Users/audih/ws/hogehoge/mhws-vision-server/docs/system/user_workflows/01_roi_setup.md), [01_roi_setup_api.md](file:///c:/Users/audih/ws/hogehoge/mhws-vision-server/docs/system/sequences/01_roi_setup_api.md), [ROI_CALIBRATOR.md](file:///c:/Users/audih/ws/hogehoge/mhws-vision-client/docs/ui/features/ROI_CALIBRATOR.md)
- **Implementation notes**:
  - `roiStore.ts`: 階層型データ構造（Rect / RelativeRect / Point）と Zustand アクション群
  - `InteractiveCanvas.tsx`: SW・NE・NW・SE の4方向リサイズ、スポイト（十字レティクル）、フェーズ別インタラクション
  - `ROICalibrator.tsx`: 4ステップウィザードUI、`NumericalAdjuster` コンポーネント
  - `api-client.ts`: スタブモードで ROI プロファイル保存・プレビュー取得をシミュレート

---

### REQ-014: サーバー API スタブ・モードの実装（結合の分離と切り分けの容易化）
- **Type**: enhancement
- **Status**: done (2026-04-19)
- **Current step**: none
- **Priority**: P1
- **Surface**: 「サーバ側に問題があってもいいように、スタブを作りたい。E2Eでの不具合切り分けも容易にしたい。UIで切り替え可能にしたい。」
- **Root Cause**: **Technical Integration / Interaction Design** - バックエンドAPIの完成度や安定性にフロントエンド開発が依存しており、開発の停滞やE2Eテスト失敗時の原因切り分け（FEかBEか）に多大な時間を要しているため。
- **Requirement**: `openapi.yaml` の仕様に基づいた API スタブ機能を実装する。UI上の設定等で「Live（実サーバー）」と「Stub（モック）」を動的に切り替えるモードを導入し、サーバーの状態に左右されない確定的なワークフロー検証環境を提供する。
- **Acceptance criteria**:
  - UI上の設定パネル等で、API通信モードを「Live」と「Stub」で切り替えられること。
  - 「Stub」モード時、`openapi.yaml` のスキーマに準拠したモックデータ（プレビュー画像、ジョブステータス、保存成功レスポンス等）が返却されること。
  - 通信エラー等の異常系シナリオもスタブ側で擬似的に再現できること。
  - 開発者が実サーバーの実装を待たずに、UIコンポーネントやビジネスロジックの結合試験を完遂できること。
  - E2Eテストやデバッグ時に、フロントエンド側の問題かバックエンド側の問題かを即座に切り分けられること。
- **Design doc**: [openapi.yaml](file:///c:/Users/audih/ws/hogehoge/mhws-vision-server/docs/system/openapi.yaml)

---

### REQ-015: SSE 駆動型ビデオ解析ワークフローの構築
- **Type**: feature
- **Status**: done (2026-04-19)
- **Current step**: none
- **Priority**: P0
- **Surface**: 「メインの解析ワークフローを実現するための、フロント側機能を構築したい。同期はREQ-013とおなじ」
- **Root Cause**: **Information Design / Interaction** - 従来の単純なポーリングやバッチ的な一覧表示では、長時間かかるビデオ解析においてユーザーを待機させてしまう。最新仕様（SSEによる進捗通知）に基づき、「見つかった側からカードを表示・編集できる」というプログレッシブなUXが欠落しているため。
- **Requirement**: `02_analysis.md` および `02_analysis_api.md` の仕様に準拠し、SSEによるリアルタイム通知を受け取り、解析完了を待たずに各護石データを順次表示・修正・保存できる高度な解析ワークフローUI의構築。
- **Acceptance criteria**:
  - ✅ 動画アップロードから解析開始、SSEイベントの購読までが一連のフローとして統合されていること。
  - ✅ `capture_extracted` イベント受信時に、一覧へ即座に「解析中カード」が追加レンダリングされること。
  - ✅ `talisman_analyzed` イベント受信時に、カード内容が最終結果（OCR内容）へ更新され、即座に手動修正が可能になること。
  - ✅ ジョブ全体の完了ステータスに関わらず、解析済みの各カードに対して独立して PATCH 通信（修正保存）ができること。
  - ✅ 進捗イベント (`progress`) に基づき、MHW風のプログレスバーが滑らかに更新されること。
  - ✅ 解析の中止 (`POST /analyze/cancel`) 操作と、中断時のUI状態整合性が確保されていること。
- **Design doc**: [02_analysis.md](file:///c:/Users/audih/ws/hogehoge/mhws-vision-server/docs/system/user_workflows/02_analysis.md), [02_analysis_api.md](file:///c:/Users/audih/ws/hogehoge/mhws-vision-server/docs/system/sequences/02_analysis_api.md)
- **Implementation notes**:
  - `sse-client.ts`: EventSource ラッパー。Stubモードによる疑似イベント（3秒間隔）発行機能を搭載。
  - `visionStore.ts`: SSE による `talismans` 配列の動的更新ロジック。中断時のクリーンアップ、REST API による状態復旧（syncJobStatus）を統合.
  - `AnalysisMonitor.tsx`: リアルタイム進捗バーと、抽出された護石のライブフィード（最近の3件）を表示する HUD。
  - `api-client.ts`: `debug_start`, `cancel` 等の新しいエンドポイントに対する Stub インターセプターの拡充。

---

### REQ-016: 統合開発環境起動スクリプトの作成（ワンアクション起動）
- **Type**: enhancement
- **Status**: done (2026-04-20)
- **Current step**: none
- **Priority**: P2
- **Surface**: フロントとバックをセットで起動できる構成。各々の仮想環境有効化やコマンド実行を自動化したい。
- **Root Cause**: Interaction (Operational inefficiency) - 各リポジトリに移動し、仮想環境を有効化して、個別にサーバーを立ち上げる作業が反復的で手間であるため。
- **Requirement**: クライアントとサーバーが隣接している環境において、仮想環境の有効化と各サーバー（Vite / FastAPI）の起動を一括あるいは選択的に実行できる Windows 用スクリプト（Batch/PowerShell）の提供。
- **Acceptance criteria**:
  - 1つのスクリプト実行で、バックエンド（Python venv有効化 + サーバー起動）とフロントエンド（npm run dev）を同時に立ち上げられること。
  - 起動オプション（引数や対話式など）により、「両方」「フロントのみ」「バックのみ」を選択できること。
  - スクリプトが隣接リポジトリを正しく自動検出し、ディレクトリ移動を意識せずに実行できること。
  - サーバー停止時に、バッチを閉じることで（可能な限り）両方のプロセスを適切に終了できること。
- **Design doc**: none

---

### REQ-017: 解析ワークフローのUX改善（プロファイル記憶とボタン活性化の修正）
- **Type**: refinement
- **Status**: new
- **Current step**: none
- **Priority**: P1
- **Surface**: 動画アップロード直後のプロファイル再選択の手間と、ボタンが活性化しない不具合の解消。
- **Root Cause**: Interaction Design / Bug - ステート初期化時の同期不備により、デフォルト値が表示されていても内部的に「未選択」となり操作不能になる。また、前回使用したプロファイルの記憶機能が不足している。
- **Requirement**: 
  1. 前回使用したプロファイルの永続化（記憶）と初期選択。
  2. 初期選択されたプロファイルのまま、ユーザーがボタン操作のみで解析を開始できる（再選択の手間を省く）。
  3. **自動開始は行わない。** あくまでユーザーの意思によるボタン押下で開始する。
- **Acceptance criteria**:
  - `localStorage` 等を用いて最後に使用したプロファイルIDが保存・復元され、ドロップダウンの初期値となること。
  - 初期表示時にプロファイルが視覚的に選択されている場合、内部ステートも同期され、手動での「再選択」なしで「INITIATE ANALYSIS」ボタンが活性化していること。
  - ユーザーがボタンをクリックした時点でのみ解析が開始されること。
- **Design doc**: none

---

### REQ-018: 動画解析プログレスバー表示の異常数値修正
- **Type**: bug
- **Status**: done (2026-04-21)
- **Current step**: none
- **Priority**: P1
- **Surface**: 解析開始直後にプログレスバーが1000%を超え、最終的に8000%などの異常な値を示す。
- **Root Cause**: Information Design - 進捗率計算の分母となる総フレーム数（または単位）と、実際に処理されるフレーム数の不整合。
- **Requirement**: 動画の実際の属性に基づき、常に 0%〜100% の範囲で正確な進捗を表示すること。
- **Acceptance criteria**:
  - ✅ 表示数値が 100% を超えないこと。
  - ✅ 1枚目のスキャン時点で異常なスケール（1000%超）にならないこと。
  - ✅ 解析完了時に 100% に到達し、視覚的な進行状況と実態が一致すること。
- **Design doc**: [PBI-018.md](file:///c:/Users/audih/ws/hogehoge/mhws-vision-client/docs/design/PBI-018.md)

---

### REQ-019: ROIキャリブレーション時のプレビュー画像表示不具合の解消
- **Type**: bug
- **Status**: completed
- **Current step**: Step 8: Finalization (Coordinator)
- **Priority**: P1
- **Surface**: ROIキャリブレーション画面（特にWINDOW AREAステップ）において、プレビュー画像が表示されず画像アイコンのみが表示される（リンク切れ状態）。
- **Root Cause**: Information Design / Bug - キャリブレーション開始時に期待されるプレビュー用画像パスの不備、またはスタブモードでのパス解決ミス。ユーザーの「デフォルト画像があるはず」という期待と実装の乖離。
- **Requirement**: キャリブレーターを開いた際、動画選択の有無に関わらず常に有効なプレビュー用サンプル画像が表示されること。
- **Acceptance criteria**:
  - ✅ 各ステップ（WINDOW AREA, TARGETS等）でプレビュー画像が視覚的に表示されていること。
  - ✅ 特定の動画が未選択の場合は、システムデフォルトのサンプル画像へとフォールバックすること。
  - ✅ 画像のURLまたはBase64が、Stub/Liveの両モードで正しく処理されること。
  - ✅ **Follow-up**: クロップ範囲に合わせた「動的アスペクト比 (Dynamic Reshaping)」の追加実装、および実画像サイズに基づく「Auto-fitting」により画像端の欠損を解消。
  - ✅ **Follow-up**: 視認性向上のためのオーバーレイ表示切替（トグルボタン）の実装。
  - ✅ **Follow-up**: ステップバーからの直接遷移（Clickable Step Bar）と、Step 1 復帰時のコンテキスト・同期の安定化。
- **Design doc**: none
- **Implementation notes**:
  - `ROICalibrator.tsx`: プレビュー画像のリセット処理 (`setPreviewImage(null)`)、非同期フラグ (`canceled`) による解像度同期の整合性確保、ステップバーの `onClick` 遷移.
  - `InteractiveCanvas.tsx`: `actualRatio` ステートによる画像実測比率の優先適用、SVGマスクの常時表示、4ステップ全てでのアスペクト比計算ロジック。

---

### REQ-020: 等幅・等間隔同期 (Equal spacing sync)
- **Type**: feature
- **Status**: new
- **Current step**: none
- **Priority**: P1
- **Surface**: スロット1の移動に連動して、他スロットの相対位置を自動更新する。
- **Root Cause**: Interaction Design - 似た形状が等間隔で並んでいるUIに対し、1つずつ個別に位置合わせをするのは手間であり、精度のバラつきも生じやすいため。
- **Requirement**: `ROICalibrator` において、スロット1の位置を変更した際に2・3番目のスロットを一定間隔（Gap）を保って追従させる連動機能を実装する。
- **Acceptance criteria**:
  - スロット1の `x`, `y` を変更した際、等間隔同期モードがONであればスロット2, 3の座標が自動的に計算・更新されること。
  - スロット間の「隙間（Gap）」をスライダーや数値入力で調整可能であること。
  - 連動のON/OFFをユーザーが任意に切り替えられること。
- **Design doc**: none

---

### REQ-021: ズームプレビュー (Zoom Preview)
- **Type**: feature
- **Status**: new
- **Current step**: none
- **Priority**: P1
- **Surface**: 操作対象ROIを拡大表示する「ルーペ」機能。
- **Root Cause**: Information Design - 数px単位の精密な位置合わせを行う際、標準的なプレビューサイズではディテールが確認しづらいため。
- **Requirement**: `InteractiveCanvas` での操作中（ドラッグ・ホバー）、操作対象の座標付近を拡大して表示するプレビュー枠（ルーペ）を表示する。拡大処理はフロントエンド側で行う。
- **Acceptance criteria**:
  - ROIをドラッグ中、またはマウスホバー中に、対象座標の拡大プレビューが表示されること。
  - 拡大プレビューには `/api/v1/vision/preview` から取得した画像をフロントエンド側で（CSSまたはCanvasにより）引き延ばして使用すること。
  - ルーペの表示位置が操作の邪魔にならないこと。
- **Design doc**: none

---

### REQ-022: キーボード操作 (Keyboard Control)
- **Type**: feature
- **Status**: new
- **Current step**: none
- **Priority**: P2
- **Surface**: 矢印キーによる座標の微調整。
- **Root Cause**: Interaction Design - マウス操作のみでは手のブレ等により1px単位の追い込みが困難であるため。
- **Requirement**: 選択中のROI（Active ROI）に対して、キーボードの矢印キーで1px単位、Shift+矢印キーで10px単位の座標移動を可能にする。
- **Acceptance criteria**:
  - 矢印キー（Up/Down/Left/Right）で、選択中のROIの `x`, `y` が 1px ずつ加減算されること。
  - Shiftキーを押し下げた状態での矢印キー操作により、10px 単位で移動すること。
  - キーボード操作による変更が即座にプレビューおよびストアに反映されること。
- **Design doc**: none

---

### REQ-023: 保存前確認画面 (Pre-save Confirmation)
- **Type**: feature
- **Status**: new
- **Current step**: none
- **Priority**: P2
- **Surface**: 設定保存前の最終確認プロセス。
- **Root Cause**: Information Design / Interaction - 設定した全てのROIについて、保存する前に切り出し結果を一括で確認することで、設定ミス（逆順や座標ズレ）を未然に防ぎたい。
- **Requirement**: ROIプロファイルの保存ボタン押下後、確定の前に全てのROIのクロップ画像をタイル状に並べて表示する確認用ダイアログ（またはステップ）を挿入する。
- **Acceptance criteria**:
  - 保存実行前に、全3スロット（または全項目）の最新クロップ画像が一覧表示されること。
  - ユーザーが一覧を確認し、「確定（保存）」をクリックした時のみAPIリクエストが発行されること。
  - 確認画面から調整ステップに戻れること。
- **Design doc**: none
