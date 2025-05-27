/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#42052d',
          50: '#f8f5f7',
          100: '#eee0ea',
          200: '#dbc0d4',
          300: '#c29db3',
          400: '#a77992',
          500: '#8c5872',
          600: '#713c57',
          700: '#5a263f',
          800: '#42052d',
          900: '#2b0018',
          950: '#1a000e',
        },
        secondary: {
          DEFAULT: '#ffa84a',
          50: '#fff8f0',
          100: '#ffefd8',
          200: '#ffdcad',
          300: '#ffc378',
          400: '#ffa84a',
          500: '#ff8c17',
          600: '#f06c00',
          700: '#c75302',
          800: '#9e4309',
          900: '#80380c',
          950: '#461c03',
        },
        accent: '#6c5dd3',
        success: '#4CAF50',
        warning: '#FFC107',
        error: '#F44336',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 10px 30px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};