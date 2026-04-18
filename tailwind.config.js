/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
    },
  },
  plugins: [],
}
