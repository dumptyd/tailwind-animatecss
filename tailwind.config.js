const defaultTheme = require('tailwindcss/defaultTheme');

const fontFamily = { ...defaultTheme.fontFamily };
delete fontFamily.serif;
fontFamily.sans.unshift('Inter');

module.exports = {
  content: [
    './demo/**/*.{html,js}'
  ],
  theme: {
    fontFamily,
    extend: {}
  },
  plugins: [
    require('./plugin')
  ]
};
