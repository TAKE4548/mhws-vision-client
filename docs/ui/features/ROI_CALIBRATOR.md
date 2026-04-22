# Feature Spec: ROI Calibrator (Interaction)

## [Role Requirement]
- **Role**: `role-ux-designer`
- **Scope**: `src/components/roi/`, `src/components/ROICalibrator.tsx`, `src/store/roiStore.ts`
- **Forbidden**: 画像上の座標計算にマジックナンバーを直接使用すること（座標変換は `roiStore` に集約する）。

---

## 1. 概要
ユーザーが護石認識の範囲（ROI）を画面上で直感的に設定・保存できる、**4段階ガイド付きウィザード**形式の高度なキャリブレーションツールです。  
REQ-013 の実装完了時点 (2026-04-19) において、以下の仕様を充足しています。

---

## 2. ウィザードの構成 (CalibrationStep)

| Step | ID | 概要 |
|:---:|:---|:---|
| 1 | `parent` | 護石情報が映る「親ウィンドウ」全体の矩形を指定 |
| 2 | `items` | レア度・スロット・スキルの各項目の子ROIを調整 |
| 3 | `normalization` | スロット判定用の「背景色基準点」「枠色基準点」をスポイトで指定 |
| 4 | `save` | プロファイル名を入力し、`POST /config/roi/profiles` へ保存 |

---

## 3. データ構造と座標系

### 3-1. `Rect` (親ウィンドウ)
```typescript
interface Rect { x: number; y: number; w: number; h: number; }
```
- 単位: **絶対ピクセル座標** (1920×1080 基準)

### 3-2. `RelativeRect` (子ROI)
```typescript
interface RelativeRect { x_rel: number; y_rel: number; w: number; h: number; }
```
- 単位: **親ウィンドウ左上からの相対ピクセル**

### 3-3. `Point` (正規化ポイント)
```typescript
interface Point { x_rel: number; y_rel: number; }
```
- 単位: **親ウィンドウ左上からの相対ピクセル**

---

## 4. インタラクション仕様

### 4-1. InteractiveCanvas (SVG オーバーレイ)
- **フェーズ検知**: `step` に応じてインタラクション種別を自動切替
- **矩形操作（Step 1, 2）**:
  - 矩形ボディをドラッグ → `move`（全体移動）
  - 四隅のハンドルをドラッグ → `nw-/ne-/sw-/se-resize`（辺・コーナーリサイズ）
  - リサイズ方位の判定には `startsWith` / `includes('w-')` を使用（文字列の誤マッチを防止）
- **スポイト操作（Step 3）**:
  - キャンバス全体がクリック領域となる（カーソル: `cursor-crosshair`）
  - クリック位置が `x_rel / y_rel` として即座に `roiStore` に記録される
  - 設定済みポイントは **グロー付き十字レティクル（2重円 + 十字線 + 中心点）** で描画

### 4-2. NumericalAdjuster コンポーネント
- 各座標フィールド（X / Y / W / H）に専用の入力欄を提供
- **±ボタン**: 1px 単位のインクリメント/デクリメント
- **直接入力**: フォーカスして値を書き換えると即座に Canvas に反映
- アクティブなターゲット（レア度、特定スロット等）を切り替えると表示される座標も自動で変わる

### 4-3. 背景プレビュー更新
- UIのレスポンスを優先するため、ROIの座標操作（ドラッグや数値入力）中にはフェッチを行わず、`step` の遷移やジョブ情報の変更時のみ `GET /vision/preview` を呼び出します。
- 新しい画像がロードされるまで旧画像を維持し、キャンバスのアスペクト比を固定することで、遷移時のフリッカーやレイアウトシフトを最小化しています。
- スタブモード時は `mock-data.ts` の `MOCK_VISION_PREVIEW` を返す

---

## 5. Zustand ストア (`roiStore`)

| アクション | 説明 |
|:---|:---|
| `updateParentWindow(Partial<Rect>)` | 親ウィンドウの座標を部分更新 |
| `updateRelativeRect(target, id, Partial<RelativeRect>)` | 指定した子ROIを部分更新 |
| `updatePoint(target, Partial<Point>)` | 正規化ポイントを部分更新 |
| `setStep(CalibrationStep)` | ウィザードのステップを変更 |
| `setActiveTarget(target, id?)` | 編集対象のフォーカスを変更 |
| `resetProfile()` | 全設定をデフォルト値に戻す |

---

## 6. API 連携

| メソッド | エンドポイント | 用途 |
|:---:|:---|:---|
| `GET` | `/vision/preview` | 現在選択中ROIの画像プレビューを取得 |
| `POST` | `/config/roi/profiles` | 完成したキャリブレーション設定を保存 |

---

## 7. [Forbidden] 事項
- Canvas のリドロー処理において、不要な React の再レンダリングが発生し、動作が重くならないよう最適化すること（`useMemo` / `useCallback` の活用）。
- 座標の変換ロジック（px ↔ 正規化座標）をコンポーネント内に直書きすること（`roiStore` または共有ユーティリティに集約すること）。
- `InteractiveCanvas` 内で `includes` を使った方位判定を行うこと（`startsWith` / `includes('<方位>-')` の厳格な形式を維持すること）。
