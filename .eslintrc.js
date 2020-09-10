module.exports = {
  extends: [
      'alloy',
  ],
  env: {
      browser: true
  },
  globals: {
    ENV: 'readonly',
    ENV_IS_PRO: 'readonly',
  },
  plugins: [
    "html"
  ],
  rules: {
    'generator-star-spacing': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-new':  0,
    'func-names': 0,
    'no-use-before-define': 0,
  },
  // settings: {
  //   'import/resolver': {
  //     webpack: {
  //       config: './webpack.config.js',
  //     },
  //   },
  // },
};
