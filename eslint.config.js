import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import vue from 'eslint-plugin-vue';
import globals from 'globals';

import { architecturePlugin } from './scripts/eslint-architecture.js';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.{js,vue}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node }, ecmaVersion: 'latest' },
    rules: { eqeqeq: 'error', 'no-var': 'error', 'prefer-const': 'error' },
  },
  {
    files: ['src/**/*.{js,vue}'],
    plugins: { architecture: architecturePlugin },
    rules: { 'architecture/boundaries': 'error' },
  },
  prettier,
];
