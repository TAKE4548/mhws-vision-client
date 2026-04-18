# UI Design System: MHW Style HUD

## [Role Requirement]
- **Role**: `role-ux-designer`
- **Scope**: `tmp/frontend/src/index.css`, `tailwind.config.js`
- **Forbidden**: `index.css` に定義されたデザイントークン以外の生の HEX コードを JSX 内で使用すること。

---

## 1. 概要
Monster Hunter Wilds の HUD デザイン（ブラック・ゴールド・ダークスレート）をベースにした、プレミアムなデザインシステムを構築します。

## 2. デザイントークン (Tailwind)
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'mhw-bg': '#0a0b0d',          // 背景（ほぼ黒）
        'mhw-panel': '#1a1c21',       // パネル
        'mhw-accent': '#c9a063',      // ゴールドアクセント
        'mhw-text': '#e0e0e0',        // テキスト
        'mhw-danger': '#a33',         // NG/Error
        'mhw-success': '#4a9',        // OK/Valid
      },
      fontFamily: {
        'hud': ['Inter', 'sans-serif'], // 可読性の高いHUDフォント
      }
    }
  }
}
```

## 3. コンポーネント意匠
- **Card**: 背景は半透明のゴールド枠。ホバー時に内側がうっすら光る。
- **ProgressBar**: 背景はダークグレー、進行部分はゴールドのグラデーション。
- **Icons**: Lucide-React または カスタムSVGアイコンを使用。

---

## 4. [Forbidden] 事項
- 流用元のデザインに引きずられすぎて、操作性を損なわないこと（特に MHW の深いメニュー階層を模倣しすぎず、Webツールとしての「フラットさ」を維持する）。
