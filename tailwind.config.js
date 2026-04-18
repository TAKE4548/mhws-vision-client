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
        'mhw-danger': '#aa3333',      // NG/Error
        'mhw-success': '#4a9990',     // OK/Valid
      },
      fontFamily: {
        'hud': ['Inter', 'sans-serif'], // 可読性の高いHUDフォント
      },
      keyframes: {
        flow: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(500%)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-bottom': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      animation: {
        flow: 'flow 2s infinite linear',
        'in': 'fade-in 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-in-bottom': 'slide-in-bottom 0.5s ease-out forwards',
      }
    },
  },
  plugins: [],
}
