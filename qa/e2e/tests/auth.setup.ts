import { test as setup, expect } from '@playwright/test'

/**
 * Logs in once per role through the real UI and saves storage state
 * (tokens live in localStorage) for the actual test projects.
 * Demo credentials are seeded by `brimz seed` (see backend .env.example).
 */
const ADMIN_STATE = '.auth/admin.json'
const VIEWER_STATE = '.auth/viewer.json'

async function login(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByPlaceholder('you@venue.com').fill(email)
  await page.getByPlaceholder('••••••••').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible()
}

setup('authenticate as admin', async ({ page }) => {
  await login(page, process.env.E2E_ADMIN_EMAIL || 'owner@brimz.tech', process.env.E2E_ADMIN_PASSWORD || 'brimz-admin')
  await page.context().storageState({ path: ADMIN_STATE })
})

setup('authenticate as viewer', async ({ page }) => {
  await login(page, process.env.E2E_VIEWER_EMAIL || 'analyst@brimz.tech', process.env.E2E_VIEWER_PASSWORD || 'brimz-viewer')
  await page.context().storageState({ path: VIEWER_STATE })
})
