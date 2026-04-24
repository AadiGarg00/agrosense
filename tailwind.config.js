/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        green: {
          50:  '#eafaec',
          100: '#d0f2d6',
          200: '#a5e5b0',
          300: '#6dd17e',
          400: '#3ab84e',
          500: '#2e9940',
          600: '#277a36',
          700: '#1e5c2a',
          800: '#143318',
          900: '#0a1a0d',
        },
        cream: '#f8f5ee',
        'cream-dark': '#ede9df',
      },
    },
  },
  plugins: [],
}
