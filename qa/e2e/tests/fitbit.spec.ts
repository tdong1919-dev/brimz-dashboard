import { test, expect } from '@playwright/test'

/**
 * M4 placeholder — Fitbit connect + synced "live user" data in the dashboard.
 * Skipped until a real Fitbit OAuth flow + live-simulation view land.
 */
test.describe('Fitbit integration (M4)', () => {
  test.skip(true, 'M4 not implemented yet — enable when Fitbit OAuth + live view land')

  test('connect Fitbit and view synced live-user data', async ({ page }) => {
    await page.goto('/')
    // Selectors intentionally left generic; wire up when the M4 UI exists.
    await page.getByRole('button', { name: /connect fitbit/i }).click()
    await expect(page.getByText(/synced|connected|live/i)).toBeVisible()
  })
})
