/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tg: {
          bg: '#f8fafc',
          text: '#0f172a',
          hint: '#64748b',
          link: '#059669',
          button: '#059669',
          buttonText: '#ffffff',
          secondaryBg: '#ffffff',
        },
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        }
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(15, 23, 42, 0.06)',
        'glow-emerald': '0 0 25px rgba(16, 185, 129, 0.28)',
        'glow-sky': '0 0 25px rgba(14, 165, 233, 0.28)',
        'glow-amber': '0 0 28px rgba(245, 158, 11, 0.35)',
      }
    },
  },
  plugins: [],
}
