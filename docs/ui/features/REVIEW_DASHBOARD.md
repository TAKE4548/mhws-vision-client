# Feature Spec: Review Dashboard

## [Role Requirement]
- **Role**: `role-ux-designer`, `role-engineer`
- **Scope**: `src/components/Dashboard.tsx`
- **Forbidden**: 護石一件ごとの詳細データをコンポーネント内にローカルステートとして閉じ込めること（Zustandへの同期を必須とする）。

---

## 1. 概要
抽出された護石データを一覧表示し、確信度の低い項目を人間が修正・確定するための中心的なインターフェースです。

## 2. 実装要件
1. **Bento Stats Panel**: 画面上部に、解析進捗、検出数、要確認数、セッションIDを表示する4枚のモジュールパネルを配置する。
2. **Kinetic Grid**: 視認性の高いグリッドレイアウトを採用。護石カードは 3:4 のアスペクト比を持つ垂直クロップ画像を左側に、データを右側に配置する。
3. **SSE Real-time Sync (REQ-015)**: SSE通知 (`capture_extracted`, `talisman_analyzed`) を受け取り、解析完了を待たずにカードを順次追加・更新する。
4. **Analysis Monitor**: 解析実行中、詳細な進捗バーとライブフィードを表示する高機能 HUD モニターを表示する。
5. **Strict Data Ordering (SPEC準拠)**: カード内のデータは以下の順序で配置されなければならない（OpenAPI 3.1 準拠のネストオブジェクトに対応）。
    - Confidence / Time (最上部)
    - Rarity (nested: value, confidence)
    - Slots (nested: value, confidence)
    - Skills (array: name, level, confidence)
6. **Digital Zoom Interaction**: カードにホバーした際、元の画像を拡大表示し、OCR/抽出の根拠となった詳細を即座に確認できるようにする。
7. **Manual Override Modal**: カードクリック時に、SPEC規定の順序（Rarity -> Slots -> Skills -> Live Feed）で詳細確認および手動修正を行うモーダルを表示する。

## 3. ステート構成 (Zustand)
- `visionStore`: 
    - `listenToEvents`: SSEストリームの確立とイベントハンドリング。
    - `syncJobStatus`: REST API によるジョブ状態の同期と復旧。
    - `talismans`: 解析済みの護石リスト。SSEにより動的に要素が追加される。
- `uiStore`: サイドバーの開閉状態（`isSidebarCollapsed`）等を管理する。

---

## 4. [Forbidden] 事項
- **表示順序の変更**: SPECで定められたデータ表示順序（Confidence -> Rarity -> Slots -> Skills）を独断で変更してはならない。
- **視認性の低下**: クロップ画像が小さすぎたり、アスペクト比が崩れたりしないよう細心の注意を払うこと。

---

## 5. データの整合性とライフサイクル (Data Integrity & Lifecycle)
### 5.1 ジョブベースのデータ分離 (Job-ID Based Partitioning)
- レビューダッシュボードの表示データは、URLパラメーターに含まれる `job_id` に完全に従属する。
- データの不適切な混入を防ぐため、APIリクエスト（GET /talismans）時は常に `job_id` によるフィルタリングを実施しなければならない。
- 新しい解析ジョブが開始される際は、ストア内の `talismans` 配列を明示的にリセットする。

### 5.2 アセット解決の単一ソース (Asset Resolution SSoT)
- 護石画像（Crops）の解決は、バックエンドから返却される絶対URL（`http://...`）を **Single Source of Truth (SSoT)** とする。
- フロントエンド側での複雑なパス組み立てロジックを排除し、提供されたURLをそのまま使用することで、デプロイ環境の変化に対する耐性を高める。
