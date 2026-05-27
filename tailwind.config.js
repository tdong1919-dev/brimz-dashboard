/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0a0d14',
          card: '#141824',
          card2: '#1a1f2e',
          border: '#2a2f3e',
          gold: '#f59e0b',
          teal: '#14b8a6',
          purple: '#a855f7',
          text: '#e2e8f0',
          muted: '#64748b',
        }
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
    }
  },
  plugins: []
}
