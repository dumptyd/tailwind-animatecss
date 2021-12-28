module.exports = {
  root: true,
  env: {
    node: true,
    'jest/globals': true
  },
  extends: [
    'airbnb-base'
  ],

  plugins: [
    'jest'
  ],

  rules: {
    semi: ['error', 'always'],
    'no-multiple-empty-lines': ['warn', { max: 3 }],
    'space-before-function-paren': ['warn', {
      anonymous: 'never',
      named: 'never',
      asyncArrow: 'always'
    }],
    curly: ['off'],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'comma-dangle': ['error', 'never'],
    'max-len': ['warn', { code: 150 }],
    'import/prefer-default-export': ['off'],
    'arrow-parens': ['off'],
    'no-param-reassign': ['off'],
    'global-require': ['off'],
    'no-underscore-dangle': ['off'],
    'object-curly-newline': ['error', { minProperties: 7, consistent: true }],
    'no-plusplus': ['off'],
    'object-shorthand': ['error', 'always'],
    'arrow-body-style': ['off'],
    'import/no-extraneous-dependencies': ['off']
  }
};
