/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'grit-green': {
          DEFAULT: '#032717',
          dark: '#021510'
        },
        'grit-gold': {
          DEFAULT: '#CEC6B5',
          light: '#D5C59F',
          dark: '#847147'
        },
        'red-jacket': {
          DEFAULT: '#991B1B',
          dark: '#7F1D1D'
        },
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        'roboto-slab': ['"Roboto Slab"', 'serif']
      },
    },
  },
  plugins: [],
}


