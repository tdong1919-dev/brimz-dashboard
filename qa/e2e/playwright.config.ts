import { defineConfig, devices } from '@playwright/test'

/**
 * Points at the Brimz dashboard (Vite dev server). Playwright starts the server
 * automatically via `webServer` unless one is already running / BASE_URL is set.
 *
 * M3: the suite drives the WIRED app, so the backend API must be up too
 * (`brimz serve` on :8000 against the seeded Docker Postgres). A `setup`
 * project logs in as Admin + Viewer through the real UI and saves storage
 * states that the test projects reuse — 30 tests, one login each per role.
 */
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on',                                   // record every test so runs are viewable in the report
    launchOptions: { slowMo: Number(process.env.SLOWMO || 0) },  // set SLOWMO=400 to watch in slow motion
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: '.auth/admin.json' },
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.ts/,
    },
  ],
  // Don't manage a server if the caller already pointed BASE_URL somewhere.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        cwd: '../../brimz-dashboard',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
