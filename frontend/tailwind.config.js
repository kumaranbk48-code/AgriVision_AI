/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        agri: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        harvest: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        loam: {
          50: '#faf8f5',
          100: '#f3efe8',
          200: '#e5ded1',
          300: '#d3c5b1',
          400: '#bca68d',
          500: '#a3876c',
          600: '#886c53',
          700: '#6e5441',
          800: '#564234',
          900: '#3e2f26',
        },
        field: {
          canvas: '#f6f8f4',
          canvasDark: '#08130c',
          cardDark: '#0f2015',
          cardDarkHover: '#142a1c',
          borderDark: 'rgba(34, 197, 94, 0.2)'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
