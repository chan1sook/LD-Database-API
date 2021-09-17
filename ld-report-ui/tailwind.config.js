module.exports = {
  purge: {
    content: [
      './components/**/*.{vue,js}',
      './layouts/**/*.vue',
      './pages/**/*.vue',
      './plugins/**/*.{js,ts}',
      './nuxt.config.{js,ts}',
    ],
    whitelistPatterns: [/svg.*/, /fa.*/],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      minWidth: {
        4: '1rem',
        8: '2rem',
        12: '3rem',
      },
      fontFamily: {
        sans: ['Prompt'],
      },
    },
  },
  variants: {
    extend: {
      textColor: ['active'],
      backgroundColor: ['active', 'odd', 'even'],
      opacity: ['disabled'],
      cursor: ['disabled'],
    },
  },
  plugins: [],
}
