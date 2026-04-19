/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MHW Style HUD (Existing)
        'mhw-bg': '#0a0b0d',
        'mhw-panel': '#1a1c1e',
        'mhw-accent': '#cac080',
        'mhw-text': '#e1e2e7',
        'mhw-success': '#78a678',
        'mhw-danger': '#aa3333',
        
        // The Kinetic Observatory (Design Strategy REQ-006)
        'kinetic-amber': '#ffc174', // Primary / Surface Tint
        'kinetic-amber-deep': '#f59e0b', // Primary Container
        'kinetic-blue': '#adc6ff', // Secondary
        'kinetic-blue-deep': '#0566d9', // Secondary Container
        
        // Surface Architecture
        'surface-lowest': '#0c0e12',
        'surface-low': '#191c1f',
        'surface-container': '#1d2023',
        'surface-high': '#282a2e',
        'surface-highest': '#323539',
        'surface-bright': '#37393d',

        // On-Surface (Text)
        'on-surface': '#e1e2e7',
        
        // Outlines (Used at low opacity only)
        'kinetic-outline': '#a08e7a',
        'kinetic-outline-variant': '#534434',

        // Semantic Status Colors (REQ-014)
        'status-error': '#ef4444',
        'status-warning': '#f59e0b',
        'status-success': '#10b981',
      },
      fontFamily: {
        'hud': ['"Noto Sans JP"', 'sans-serif'],
        'space': ['"Space Grotesk"', 'sans-serif'],
        'manrope': ['"Manrope"', 'sans-serif'],
      },
      letterSpacing: {
        'tight-eng': '-0.02em',
        'wide-tech': '0.1em',
      },
      borderRadius: {
        'tech': '0.25rem', // Default for buttons/inputs
        'dashboard': '0.75rem', // For main dashboard containers
      }
    },
  },
  plugins: [],
}
