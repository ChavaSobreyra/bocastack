module.exports = {
  root: true,
  plugins: ['prettier', 'import', 'jest'],
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended',
    'plugin:vue/vue3-recommended',
    // prettier must come last to avoid conflicts with eslint-plugin-vue
    // https://eslint.vuejs.org/user-guide/#conflict-with-prettier
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2021,
  },
  env: {
    node: true,
    jest: true,
    browser: true,
  },
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/camelcase': 'off',
    'prettier/prettier': 'error',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        'newlines-between': 'always',
      },
    ],
    'import/newline-after-import': 'error',
    'import/no-useless-path-segments': 'error',
    'jest/no-focused-tests': 'error',
    'arrow-parens': [2, 'as-needed'],
    'object-shorthand': 'error',
    eqeqeq: 'error',
    'dot-notation': 'error',
    curly: ['error', 'multi'],
  },
}
