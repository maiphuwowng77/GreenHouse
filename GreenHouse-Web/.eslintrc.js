module.exports = {
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  env: {
    browser: true,
  },
  extends: [
    'plugin:vue/recommended',
    'eslint:recommended',
  ],
  rules: {
    'no-debugger': 'off',
    'vue/no-v-model-argument': 'off',
    'no-unused-vars': 'off',
  },
};