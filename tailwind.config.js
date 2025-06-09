/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f8faf8',
          100: '#f0f4f0',
          200: '#e1e9e1',
          300: '#c9d6c9',
          400: '#a8bea8',
          500: '#5c745c', // Main sage green
          600: '#4a5f4a',
          700: '#3d4f3d',
          800: '#334233',
          900: '#2a372a',
        },
        cream: {
          50: '#fefefe',
          100: '#fdfdfd',
          200: '#faf9f7',
          300: '#f7f5f1',
          400: '#f2efe8',
          500: '#ebe6db',
          600: '#d4c9b8',
          700: '#b8a894',
          800: '#9a8876',
          900: '#7d6e5f',
        }
      },
      fontFamily: {
        primary: ['var(--font-primary)', 'var(--font-sans)', 'sans-serif'],
        gorgeous: ['var(--font-gorgeous)', 'var(--font-serif)', 'serif'],
        script: ['var(--font-script)', 'cursive'],
        headings: ['var(--font-headings)', 'cursive'],
        sans: ['var(--font-sans)', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      }
    },
  },
  plugins: [],
}