# Design: Foundational UI & Prototype (REQ-003)

## 1. 概要
本設計は、`DESIGN_SYSTEM.md` に基づく MHW スタイルの高精度な UI プロトタイプを構築するためのものです。Streamlit 版からの移行を見据え、Web ツールとしての操作性と HUD の没入感を両立させます。

## 2. レイアウト構造
- **Global Layout**:
    - **Sidebar**: ナビゲーション（Dashboard, ROI Calibrator, Settings）。ゴールドの左ボーダー。
    - **Header**: プロジェクト名「TALISMAN VISION」と現在のセッション状態。
    - **Main Content**: 各機能の表示エリア。`mhw-bg` 背景。
- **Component Stack**:
    - `Layout`: 全体のコンテナ。
    - `Sidebar`: リンクメニュー。
    - `HUDPanel`: 共通の枠線デザイン（ゴールドの半透明ボーダー）を持つパネル。

## 3. 状態管理 (Zustand)
`uiStore` を作成し、以下の状態を管理します：
- `activeTab`: 'dashboard' | 'roi-calibrator'
- `isScanning`: boolean (Mock 用)

## 4. 画面詳細
### Dashboard
- 3カラムのグリッドレイアウト。
- 護石キャプチャカード（画像、認識結果、信頼度スコア）。
- ステータスインジケーター（Scanning/Complete）。

### ROI Calibrator
- 画像プレビューエリア（中央）。
- ROI 設定ツールバー（右サイド）。
- プリセット選択（左サイド）。

## 5. モックデータ (Mock Data)
- `captures`: 認識された護石の配列。
- `roiSettings`: 現在の抽出範囲設定。

---

## 6. Trade-offs and Constraints
- **Interactivity**: プロトタイプ段階では、ブラウザのストレージや API 通信は行わず、インメモリの Zustand 状態のみを使用します。
- **Visuals**: パフォーマンスに配慮し、複雑な CSS フィルターは限定的に使用し、Tailwind のカスタムユーティリティを優先します。
