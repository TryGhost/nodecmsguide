import tsParser from '@typescript-eslint/parser';
import astro from 'eslint-plugin-astro';

export default [
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-recommended'],
  {
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
      },
    },
  },
];
