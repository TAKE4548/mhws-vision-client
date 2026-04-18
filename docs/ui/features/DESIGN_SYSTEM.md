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
