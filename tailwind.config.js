/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'ui-serif', 'serif'],
        sans: ['"Public Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Warm off-white surfaces: paper for backgrounds and rules, ink for type.
        paper: {
          50: '#fbf8f2',
          100: '#f5efe4',
          200: '#ece4d5',
          300: '#ded4c1',
          400: '#c8bca4',
        },
        ink: {
          900: '#1d1a15',
          700: '#3d382e',
          500: '#6b6455',
        },
        rust: {
          300: '#c9573a',
          400: '#9c3d27',
          500: '#b4482f',
          600: '#9c3d27',
        },
        moss: {
          400: '#2f6b4f',
          500: '#255840',
          600: '#255840',
        },
      },
      boxShadow: {
        glow: '0 10px 22px -14px rgba(58, 42, 26, 0.65)',
        panel: '0 1px 0 rgba(255, 255, 255, 0.8) inset, 0 8px 24px -20px rgba(58, 42, 26, 0.5)',
      },
    },
  },
  plugins: [],
}
