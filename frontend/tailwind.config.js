/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1C2B33',
        slate: '#4B5D67',
        canvas: '#F6F4EF',
        brass: '#B08D57',
        moss: '#5B7A63',
        clay: '#B4553F',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
