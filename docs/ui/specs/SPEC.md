# .antigravity/specs/SPEC.md  
## コンポーネント詳細仕様  

---

## 1. Dashboard コンポーネント仕様  

### Visual Definition  
- **カラーパレット**  
  - `kinetic-surface-high`: カード背景（3D効果付き）  
  - `kinetic-amber`: UNITラベル（アクセントカラー）  
  - `kinetic-blue`: OCR IN PROGRESSラベル（ステータスカラー）  
  - `status-error`: エラーメッセージ用（赤系トーン）  
- **フォントスタイル**  
  - `font-hud`: Noto Sans JP（UIテキスト用）  
  - `font-space`: Space Grotesk（ステータスラベル用）  
- **デザイントークン**  
  - `rounded-dashboard`: 0.75rem（カードの角丸）  
  - `shadow-lg`: カードの陰影（デスクトップ向け）  
  - `glow-amber`: `kinetic-amber`のハイライトグロー（ホバー時）  

### Responsive Behavior  
- **デスクトップ**  
  - 4つのBento Stats Panelがグリッドレイアウト（2列×2行）  
  - サイドバーが常に表示（幅: 200px）  
- **モバイル**  
  - Bento Stats Panelが縦並び（1列）  
  - サイドバーが非表示（`isSidebarCollapsed`時）  

### State UI  
- **ローディング状態**  
  - `isProcessing`時: `cursor-wait` + `RefreshCcw`アイコンアニメーション  
  - Skeleton UI: `TalismanCard`のプレースホルダー（グレースケール）  
- **エラー状態**  
  - `status-error`カラーのバッジ表示（例: "データ読み込み失敗"）  
  - エラーメッセージの下に再試行ボタン  
- **空状態**  
  - "Engine Standby"メッセージの表示（`kinetic-blue`テキスト）  
  - アップロードアイコンのアニメーション付き  

---

## 2. ROICalibrator コンポーネント仕様  

### Visual Definition  
- **インタラクティブキャンバス**  
  - `InteractiveCanvas`: SVGキャンバスの背景色は`kinetic-surface-high`  
  - ROI選択領域: `kinetic-amber`の半透明オーバーレイ  
- **数値調整コンポーネント**  
  - `NumericalAdjuster`: MHW風のアクセントカラー（`kinetic-amber`のボタン）  
  - スライダーのハンドルに`rounded-tech`（0.25rem）  

### Responsive Behavior  
- **デスクトップ**  
  - ステップナビゲーション（4段階）が横並び表示  
  - キャンバスサイズ: 800px × 600px  
- **モバイル**  
  - ステップナビゲーションが縦並び（タップでステップ切り替え）  
  - キャンバスサイズ: 100vw × 70vh  

### State UI  
- **ローディング状態**  
  - キャンバス上に`Processing`アイコンと"ROI計算中"メッセージ  
- **エラー状態**  
  - `status-error`カラーのバッジ（例: "ROI領域が重複しています"）  
- **空状態**  
  - キャンバス中央に"ROIをドラッグして選択"のガイドメッセージ  

---

## 3. Sidebar コンポーネント仕様  

### Visual Definition  
- **レイアウト**  
  - `isSidebarCollapsed`時: 幅20px（アイコンのみ表示）→ 64px（テキスト表示）  
  - `kinetic-amber`のハイライトグロー（アクティブなセクション）  
- **UI要素**  
  - `API_STUB_MODE` / `LIVE_SERVER`トグルボタン: `kinetic-blue`の背景  
  - エラーシミュレーションボタン: `status-error`カラーのアイコン  

### Responsive Behavior  
- **デスクトップ**  
  - サイドバーが常に表示（幅: 200px）  
- **モバイル**  
  - サイドバーが非表示（ハンバーガーメニューで開閉）  

### State UI  
- **ローディング状態**  
  - トグルボタンに`cursor-wait`とローディングアイコン  
- **エラー状態**  
  - エラーメッセージの表示（`status-error`カラーのテキスト）  
- **空状態**  
  - メニュー項目が無かった場合の"設定がありません"メッセージ  

---

## 4. デザインシステムとの整合性  
- **セマンティックカラー**  
  - `kinetic-amber`, `kinetic-blue`, `status-error`の適用範囲を一貫して使用  
- **フォントスタイル**  
  - `font-hud`（Noto Sans JP）: メインUIテキスト  
  - `font-space`（Space Grotesk）: ステータスラベル・ボタンテキスト  
- **角丸・陰影**  
  - `rounded-dashboard`（0.75rem）: カード系コンポーネント  
  - `rounded-tech`（0.25rem）: ボタン・アイコン  

---  
**注**: 本仕様は`REQ-015`（Analysis Monitor HUD）に準拠し、すべてのコンポーネントが一貫したUI/UXを提供することを目的としています。