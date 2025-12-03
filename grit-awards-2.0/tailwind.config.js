/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'grit-green': '#032717',
        'grit-gold-light': '#cec6b5',
        'grit-gold-dark': '#847147',
        'grit-red': '#991b1b',
        'grit-red-dark': '#7f1d1d',
      },
      fontFamily: {
        'heading': ['Roboto Slab', 'serif'],
        'body': ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


