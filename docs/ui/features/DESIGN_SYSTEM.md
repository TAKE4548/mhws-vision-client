# UI Design System: Kinetic Observatory

## [Role Requirement]
- **Role**: `role-ux-designer`
- **Scope**: `src/index.css`, `tailwind.config.js`
- **Forbidden**: `index.css` に定義されたデザイントークン以外の生の HEX コードを JSX 内で使用すること。

---

## 1. 概要
「Kinetic Observatory（動的観測所）」は、Monster Hunter Wilds の HUD デザインからインスパイアされた、高密度でテクニカルな情報提示を目的としたデザインシステムです。
物理的な「線」による区切りを最小限に抑え、面（Surface）の階層と環境光（Glow）によってセクションを定義します。

## 2. デザイントークン (Tailwind)

### Colors
| Token | HEX | 用途 |
|---|---|---|
| `surface-lowest` | `#0a0b0d` | アプリケーション全体の基底背景 |
| `surface-low` | `#111318` | メインコンテンツエリア |
| `surface-mid` | `#1a1c21` | デフォルトのパネル面 |
| `surface-high` | `#252830` | ホバー時や強調パネル |
| `surface-bright` | `#323642` | 最上位のアクティブ面 |
| `on-surface` | `#e0e0e0` | 標準テキスト |
| `kinetic-amber` | `#ffc174` | プライマリ・アクセント（ゴールド） |
| `kinetic-blue` | `#adc6ff` | テクニカル・アクセント（ブルー） |
| `status-error` | `#ef4444` | エラー、Stubモード、危険なアクション |
| `status-warning` | `#f59e0b` | 注意、未検証データ、処理待ち |
| `status-success` | `#10b981` | 正常完了、Liveモード通信中 |

### Typography
- **Primary**: `Inter` (可読性重視)
- **Technical**: `Space Grotesk` (数値、ID、ステータス、見出し用)
- **Label**: `Space Mono` (超小型ラベル、メタデータ用)

## 3. 基本原則
- **No-Line Rule**: 境界（Border）を引く代わりに、背景色のわずかな差異（Surface Tier）でセクションを分離する。
- **Liquid Neon**: インタラクティブな要素は「流体ネオン」演出（鮮やかなグラデーションとグロー）を適用する。
- **Glassmorphism**: モーダルやオーバーレイは、背景ぼかし（Backdrop Blur）と低コントラストの境界線を組み合わせる。

---

## 4. [Forbidden] 事項
- フラットデザインに寄りすぎて、情報の優先順位が不明瞭にならないよう、影（Drop Shadow）ではなく光（Inner/Outer GLow）で奥行きを表現すること。

---

## 5. プロジェクト固有カラートークン (mhw-*)

> REQ-013 (ROI Calibrator) 実装にて確立。Tailwind CSS のカスタムカラーとして定義済み。

| Token | 用途 |
|:---|:---|
| `mhw-accent` | ゴールドアクセント。アクティブ状態、CTAボタン、ハンドル、グロー光源として使用 |
| `mhw-text` | メインテキスト。標準的な可読性を保つグレー系 |
| `mhw-bg` | メインの暗い背景色 |
| `mhw-panel` | パネル・カード系コンポーネントの背景 |

> **Note**: これらは `kinetic-amber` 等のグローバルトークンを MHW UIコンテキスト向けに意味論的に再マッピングしたものです。HEX値は `tailwind.config.js` の `theme.extend.colors` を参照してください。

---

## 6. 共通コンポーネント

### 6-1. NumericalAdjuster
> `src/components/ROICalibrator.tsx` に定義済み。ROI座標の精密調整に使用。

**用途**: 数値をもつパラメータを1単位ずつ増減、またはキーボードで直接入力する共通UI。

**Anatomy**:
```
[ − ] [ <input type="number"> ] [ + ]
  ↑                               ↑
border-r                      border-l
```

**Props**:
| Prop | Type | 説明 |
|:---|:---|:---|
| `label` | `string` | 上部に表示されるラベル（例: "X Offset", "Width"） |
| `value` | `number` | 現在の値 |
| `onChange` | `(val: number) => void` | 値変化時のコールバック |
| `min` | `number` | 最小値 (default: 0) |
| `max` | `number` | 最大値 (default: 2000) |

**スタイル原則**:
- コンテナ: `bg-white/5 border border-white/10 rounded overflow-hidden`
- ボタン: ホバー時 `bg-white/10`、テキストは `mhw-accent`
- 入力欄: `bg-transparent font-mono text-center`

---

### 6-2. Analysis Monitor HUD (REQ-015)
> `src/components/vision/AnalysisMonitor.tsx` に定義。解析中の状況を俯瞰するテクニカル・モニター。

**デザイン構成**:
1. **Kinetic Progress Bar**:
   - `kinetic-blue` の発光色を使用し、内部を「Energy Flow」アニメーションが流れる。
   - 10個の「Progress Pips」が 10% 刻みで点灯し、全体の達成率を強調する。
2. **Live Discovery Cards**:
   - 解析で見つかった最新の3件を右側のスタックに表示。
   - `capture_id` の下4桁を `UNIT_XXXX` 形式で表示し、抽出直後は `PROCESSING` ラベルが点滅する。
3. **Tactical Stat Header**:
   - `Activity` アイコンがパルス発光し、現在の Job ID や接続ステータスをテクニカル・ラベルとして表示。

**インタラクション**:
- `ABORT TACTICAL SCAN`: 危険を示す `kinetic-danger` 色を採用し、ホバー時に拡大・発光する。
- **Auto-Sync**: ジョブ開始時に他画面から自動遷移し、完了またはキャンセルで解除される。

---

## 7. SVG インタラクションパターン

> SVGオーバーレイを用いた高度な描画は `InteractiveCanvas.tsx` を参照。

### 7-1. Glow Filter
HUD風の発光エフェクト。SVG内の `<defs>` に定義し `style={{ filter: 'url(#glow-amber)' }}` で参照する。

```svg
<filter id="glow-amber">
  <feGaussianBlur stdDeviation="0.4" result="blur"/>
  <feMerge>
    <feMergeNode in="blur"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>
```

### 7-2. 十字レティクル（スポイト用）
スポイト操作で指定したポイントを示す、精密照準器風のUI。

**構成要素**:
1. **Outer Ring**: 外側の薄いフォーカスリング (`stroke-mhw-accent/20`)
2. **Inner Ring**: 内側の視準補助リング (`stroke-white/40`)
3. **Crosshair Lines**: 水平・垂直の十字線 (`stroke-mhw-accent/60`)
4. **Center Core**: 中心の塗りつぶし点 (`fill-mhw-accent`)

### 7-3. マスク (ROI Dimming)
アクティブなROI以外の領域を暗くして視点を誘導するパターン。`evenodd` fillRule を利用した SVG クリッピングで実装。

```svg
<path
  fill="rgba(0,0,0,0.6)"
  fillRule="evenodd"
  d={`M 0 0 H 100 V 100 H 0 Z M ${x} ${y} h ${w} v ${h} h ${-w} z`}
/>
```

---

## 8. インタラクション状態パターン

| 状態 | 実装方法 | 例 |
|:---|:---|:---|
| アクティブ選択 | `bg-mhw-accent text-mhw-bg` | ターゲット選択ボタン, ステップインジケーター |
| ホバー | `hover:bg-white/10` | パネル内のボタン全般 |
| 無効 | `opacity-20 pointer-events-none` | 戻るボタン(最初のStep) |
| グロー点滅 | `animate-pulse` + `text-mhw-accent` | Live Calibration Mode インジケーター |
| カーソル切替 | `cursor-crosshair` (normalizationフェーズのみ) | InteractiveCanvas |
