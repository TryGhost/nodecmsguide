import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.astro/**',
      'public/**',
      'tmp/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      '.netlify/**',
    ],
  },

  // Base JS rules everywhere
  js.configs.recommended,

  // TypeScript (.ts, .tsx)
  ...tseslint.configs.recommended,

  // React (.tsx) — React 19 with jsx-runtime, no React-in-scope needed
  {
    files: ['**/*.tsx'],
    ...react.configs.flat.recommended,
    ...react.configs.flat['jsx-runtime'],
    languageOptions: {
      ...react.configs.flat.recommended.languageOptions,
      globals: { ...globals.browser },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      'react/prop-types': 'off',
    },
  },

  // Astro (.astro) — requires the plugin's own flat presets
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-recommended'],

  // Node scripts (plain JS)
  {
    files: ['scripts/**/*.js', '*.config.js', '*.config.ts', '*.config.mjs'],
    languageOptions: {
      globals: { ...globals.node },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },

  // Vitest test files — relax a few rules that are noisy in tests
  {
    files: ['scripts/__tests__/**/*.test.js', 'tests/**/*.{js,ts}'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'no-empty': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
];
