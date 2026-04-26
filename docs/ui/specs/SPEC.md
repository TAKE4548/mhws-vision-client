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

## 2. Discovery Components (REQ-029)

### Visual Definition
- **VisionImage (Robust Image Loader)**
  - `Loading State`: `Loader2` アニメーションと `animate-pulse` によるスケルトン表示。
  - `Error State`: `ImageOff` または `Scan` アイコンによるプレースホルダー表示。
  - `Retry Logic`: 画像取得失敗時、1.5秒の待機後にキャッシュバスター付きで自動リトライ。
  - `Aesthetic Scanline`: ロード完了した画像上に `animate-scan` による透過スキャンラインを重畳。
- **Discovery Card (Analysis Monitor)**
  - `Thumbnail`: `64px x 64px` の `VisionImage` コンテナ。
  - `Aesthetic Border`: `kinetic-blue/40` の左ボーダー。
  - `Animation`: `slide-in-from-right-4` による動的な出現演出。

---

## 3. ROICalibrator コンポーネント仕様  

### Visual Definition  
- **インタラクティブキャンバス**  
  - `InteractiveCanvas`: ターゲット領域（Parent -> Window -> Slot）に合わせた「動的アスペクト比追従 (Dynamic Reshaping)」を実装。
  - `Layout Stability (Flicker-free)`: プレビュー画像が切り替わる際、新しい画像が完全にロードされるまで旧画像のアスペクト比と表示内容を維持することで、遷移時のガタつきや空白時間を排除。
  - `Auto-fitting`: 読み込まれた画像の実解像度を検知し、コンテナのアスペクト比を物理的に補正することで、ウルトラワイド環境等での画像端の欠損を防止。
  - `Masking`: 選択範囲外を暗転させるSVGマスク。オーバーレイ非表示設定時でも維持される必須コンポーネント。
- **UI制御・オーバーレイ**
  - `Visibility Toggle`: 目アイコンのトグルボタンにより、PHASE/TARGET名称、Live Calibration Mode バッジの表示・非表示を切替。
  - `Calibration Badge`: 右上に「Live Calibration Mode」バッジを常時表示（トグル可）。
- **ステップ構成 (6フェーズ)**
  - `0. Setup`: プロファイル選択または新規作成。既存プロファイル選択時は `2. Window Area` へスキップ。
  - `1. Source Frame`: 動画から基準フレームを選択。新規作成時のみ必須。
  - `2. Window Area`: 護石情報の全体表示範囲を設定。
  - `3. Item ROIs`: レア度、スロット、スキルの各項目枠を微調整。以下の4つの独立した同期グループ（Gap管理）を含む。
    - Slot Icons (X-Gap)
    - Slot Level Borders (X-Gap)
    - Skill Names (Y-Gap)
    - Skill Level Borders (Y-Gap)
  - `4. Normalization`: スキャン精度のための基準点（背景・枠）を指定。
  - `5. Save Profile`: プロファイル名を入力して保存。既存の場合は上書き (PUT)。
- **数値調整コンポーネント**  
  - `NumericalAdjuster`: MHW風のアクセントカラー（`kinetic-amber`のボタン）  
  - スライダーのハンドルに`rounded-tech`（0.25rem）  

### Responsive Behavior  
- **デスクトップ**  
  - ステップナビゲーション（6段階）が横並び表示。
  - 既存プロファイル選択時は Step 1 をスキップし、Step 0 から Step 2 へ直接遷移する。
  - 各ステップ番号をクリックすることで、直接的なフェーズジャンプが可能。
  - キャンバスサイズ: 最大 `70vh` の可変アスペクト比（動的追従）。
- **モバイル**  
  - ステップナビゲーションが縦並び（タップでステップ切り替え）。
  - キャンバスサイズ: 100vw × 可変高さ（アスペクト比固定）。

### State UI  
- **ローディング状態**  
  - キャンバス上に`Processing`アイコンと"ROI計算中"メッセージ  
- **エラー状態**  
  - `status-error`カラーのバッジ（例: "ROI領域が重複しています"）  
- **空状態**  
  - キャンバス中央に"ROIをドラッグして選択"のガイドメッセージ  
- **データ堅牢性とフェイルセーフ**
  - **構造保証 (Structure Enforcement)**: DB上のレガシーデータに欠落がある場合、`DEFAULT_PROFILE` を用いて不足フィールド（resolution, slots等）を自動補完し、実行時クラッシュを防止する。
  - **ゼロ除算ガード (Zero-division Protection)**: キャンバス描画時の座標計算において、分母が 0 または `undefined` になるのを防ぐガードを適用。
  - **APIパースの柔軟性**: APIレスポンスの自動アンラップと手動パースの両方に対応し、データ構造の不整合による状態破壊を防止。

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

## 5. Talisman Details Modal (REQ-034)

### Visual Definition
- **Debug Toggle**: 右上に配置された「DEBUG OFF/ON」切り替えボタン。ON状態では `kinetic-amber` のグロー効果と `animate-pulse` による心拍アニメーションを付与。
- **Waveform Graph (Slot Debug)**:
  - `Polyline`: `kinetic-cyan` によるスキャン波形の描画。
  - `Threshold Line`: `status-error/40` による判定閾値の水平線。
  - `Animation`: 出現時に `animate-in fade-in duration-500` を適用。
- **Crop Accordion (Skill Debug)**:
  - `Aesthetic Panel`: 各スキル項目の下に展開されるデバッグパネル。
  - `VisionImage`: 判定に使用された生のクロップ画像を表示。`border-white/5` による繊細な枠線。

### Interaction Logic
- **Toggle State**: `showDebug` 状態はモーダル内で完結（Component-local state）。閉じるとリセットされる。
- **Lazy Rendering**: デバッグ情報の波形や画像は `showDebug` が true の場合のみ DOM に追加され、初期ロード時の負荷を軽減する。

---

## 6. デザインシステムとの整合性  
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