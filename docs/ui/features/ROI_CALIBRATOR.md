# Feature Spec: ROI Calibrator (Interaction)

## [Role Requirement]
- **Role**: `role-ux-designer`
- **Scope**: `tmp/frontend/src/components/roi/`
- **Forbidden**: 画像上の座標計算にマジックナンバーを直接使用すること（アスペクト比計算を共通化すること）。

---

## 1. 概要
ユーザーが解析対象の範囲（ROI）を画像上で直接指定できる、高度なインタラクション・ツールです。

## 2. 実装要件
1. **Interactive Canvas**: 背景画像の前面に Canvas/SVG レイヤーを重ね、矩形をドラッグでリサイズ、移動させる。
2. **Sub-ROI Visualization**: 親領域（護石全体）だけでなく、その中のサブ領域（スキル1, 2, スロット等）もオーバーレイで表示。
3. **Coordinate Sync**: 画面上のピクセル座標を、バックエンドに送るための正規化座標（0.0-1.0等）に変換・同期。

## 3. インタラクションフロー
1. 動画の特定フレームをロード。
2. ユーザーがマウス/タッチで矩形を調整。
3. 手を離したタイミングで座標を `Zustand` ストアに保存。
4. サイドバーの数値入力欄と双方向に同期。

---

## 4. [Forbidden] 事項
- Canvas のリドロー処理において、不要な React の再レンダリングが発生し、動作が重くならないよう最適化すること（`requestAnimationFrame` または `memo` の活用）。
