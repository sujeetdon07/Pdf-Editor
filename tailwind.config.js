/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#070b16',
          900: '#0d1424',
          850: '#131c30',
          800: '#1b2740',
          700: '#273450',
          500: '#64748b',
          300: '#a7b2c7',
          100: '#e6ebf5',
        },
        iris: {
          300: '#b7a7ff',
          400: '#9a86ff',
          500: '#7c5cff',
          600: '#6741e6',
        },
        mint: {
          400: '#35e0c0',
          500: '#14c8a6',
        },
      },
      boxShadow: {
        glow: '0 18px 60px -20px rgba(124, 92, 255, 0.55)',
      },
      backgroundImage: {
        aurora:
          'radial-gradient(60rem 30rem at 15% -10%, rgba(124,92,255,0.28), transparent 60%), radial-gradient(50rem 26rem at 95% 0%, rgba(20,200,166,0.20), transparent 55%)',
      },
    },
  },
  plugins: [],
}
