const colors = require('tailwindcss/colors')

module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false,
  theme: {
    fontFamily: {
      'sans': ['ui-sans-serif', 'system-ui'],
      'serif': ['ui-serif', 'Domine'],
      'mono': ['ui-monospace', 'SFMono-Regular'],
      'body': ['"Open Sans"'],
    },
    extend: {
      fontSize: {
        '4+xl' : '2.6rem',
      },
      colors: {
        lime: colors.lime,
        'gray-115': '#f0f0f0',
        'gray-130': '#ededed'
      },
      maxWidth: {
        '3/4': '75%',
        '2/3': '66%',
        '1/2': '50%',
        '1/4': '25%',
      }
    }
  }
}