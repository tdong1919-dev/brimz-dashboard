import { test, expect } from '@playwright/test'

/**
 * Role gating — a Viewer can read the dashboard but has no Admin surface.
 * Runs with the viewer storage state saved by auth.setup.ts.
 */
test.use({ storageState: '.auth/viewer.json' })

test.describe('Viewer role', () => {
  test('sees the dashboard but no Admin link', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Admin', exact: true })).toHaveCount(0)
  })

  test('direct /admin visit bounces back to Overview', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible()
  })
})
