/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Sage Green Primary
        'todo-primary': {
          50: '#f0f7f0',
          100: '#dceedd',
          200: '#b5ddbb',
          300: '#82c492',
          400: '#56a86a',
          500: '#3d8f52',
          600: '#2e7340',
          700: '#265c35',
          800: '#21492d',
          900: '#1c3c27',
        },
        // Warm Gray Neutral
        'todo-neutral': {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Noto Sans SC', 'sans-serif'],
      },
      borderRadius: {
        'todo-sm': '6px',
        'todo-md': '10px',
        'todo-lg': '14px',
      },
      boxShadow: {
        'todo-sm': '0 1px 2px rgba(28, 25, 23, 0.03)',
        'todo-md': '0 2px 8px rgba(28, 25, 23, 0.04)',
        'todo-float': '0 8px 24px rgba(28, 25, 23, 0.08)',
      },
    },
  },
  plugins: [],
};
