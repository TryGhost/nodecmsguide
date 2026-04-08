import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright covers two kinds of tests in this repo:
 *  1. `tests/e2e/build-output.spec.ts` — file-system assertions over `dist/`.
 *     These don't need a browser but ride along with the Playwright runner so
 *     they share CI job setup with the render specs.
 *  2. `tests/e2e/render.spec.ts` — real browser assertions against the Astro
 *     preview server.
 *
 * Both require a prior `NODE_CMS_USE_FIXTURE=1 npm run build`. We don't build
 * from Playwright because the build step is a prerequisite for dist-output
 * assertions — building inside `webServer` would race.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL: 'http://localhost:4321',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npx astro preview --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NODE_CMS_USE_FIXTURE: '1',
    },
  },
});
