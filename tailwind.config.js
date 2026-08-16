/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f1',
          100: '#ffe0e0',
          500: '#e5322d',
          600: '#d0211d',
          700: '#ab1a17',
        },
      },
    },
  },
  plugins: [],
}
