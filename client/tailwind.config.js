/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f4ff',
          100: '#dce6fe',
          200: '#c0d0fd',
          300: '#94aefb',
          400: '#6080f8',
          500: '#3d55f0',
          600: '#2d3fe6',
          700: '#242fd3',
          800: '#2229ab',
          900: '#212888',
        },
        accent: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
