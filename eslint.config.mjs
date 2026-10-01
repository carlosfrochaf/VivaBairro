export default [
  {
    files: ['**/*.{js,mjs,cjs}'],
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
    },
  },
];
