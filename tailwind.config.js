/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'box': '6px',
      },
      boxShadow: {
        'tiny': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'micro': '0 1px 1px 0 rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
