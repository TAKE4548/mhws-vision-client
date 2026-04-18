# Feature Spec: ROI Calibrator (Interaction)

## [Role Requirement]
- **Role**: `role-ux-designer`
- **Scope**: `tmp/frontend/src/components/roi/`
- **Forbidden**: 画像上の座標計算にマジックナンバーを直接使用すること（アスペクト比計算を共通化すること）。

---

## 1. 概要
ユーザーが解析対象の範囲（ROI）を画像上で直接指定できる、高度なインタラクション・ツールです。

## 2. 実装詳細
1. **Interactive Canvas (SVG)**: 背景画像の前面に SVG レイヤーを重ね、矩形をドラッグでリサイズ、移動させる機能を実装済み。
2. **Coordinate Sync**: 画面上のピクセル座標は、`roiStore` (Zustand) 内で正規化座標（0.0-1.0）に変換され、管理される。
3. **Handle System**: 特徴的な黄色のハンドルによる、直感的なリサイズ操作をサポート。

## 3. インタラクションフロー
1. プレビュー画像を画面一杯にロード（未指定時はプレースホルダー表示）。
2. ユーザーがマウスで矩形またはハンドルを調整。
3. ドラッグ中および終了時に座標を `Zustand` ストアに即座に同期。
4. サイドバーの数値入力欄（ピクセル換算表示）と双方向に同期。

---

## 4. [Forbidden] 事項
- Canvas のリドロー処理において、不要な React の再レンダリングが発生し、動作が重くならないよう最適化すること（`requestAnimationFrame` または `memo` の活用）。
