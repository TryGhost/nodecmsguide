import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['scripts/**/*.test.js'],
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
    globals: false,
    coverage: {
      provider: 'v8',
      include: ['scripts/**/*.js'],
      exclude: ['scripts/**/*.test.js', 'scripts/__tests__/**'],
      reporter: ['text', 'text-summary'],
      thresholds: {
        'scripts/**/*.js': {
          lines: 100,
          functions: 100,
          statements: 100,
          branches: 100,
        },
      },
    },
  },
});
