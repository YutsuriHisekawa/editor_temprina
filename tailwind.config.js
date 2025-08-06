/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'gray-750': '#313131',
        'gray-850': '#1e1e1e',
        'gray-950': '#0e0e0e',
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      minWidth: {
        '32': '8rem',
      },
      maxWidth: {
        '48': '12rem',
      }
    },
  },
  plugins: [],
};