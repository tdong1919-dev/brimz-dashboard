import { test, expect } from '@playwright/test'

/**
 * Admin data panel. The reseed test rebuilds the database (seconds of churn),
 * so it only runs when RESEED_E2E=1 — CI sets it; local runs keep their data.
 */

test.describe('Admin data panel', () => {
  test('shows current stadium data status', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByTestId('admin-attendees')).not.toBeEmpty()
    await expect(page.getByText('Mock data — simulated stadium')).toBeVisible()
  })

  test('reset requires typed confirmation', async ({ page }) => {
    await page.goto('/admin')
    await page.getByRole('button', { name: /Reset all tables/ }).click()
    const resetBtn = page.getByRole('button', { name: 'Reset everything' })
    await expect(resetBtn).toBeDisabled()
    await page.getByPlaceholder('RESET').fill('nope')
    await expect(resetBtn).toBeDisabled()
    await page.getByRole('button', { name: 'Cancel' }).click()
  })

  test('reseeding reshapes the stadium (attendee count changes)', async ({ page }) => {
    test.skip(process.env.RESEED_E2E !== '1', 'set RESEED_E2E=1 to run the destructive reseed test')
    test.setTimeout(180_000)

    await page.goto('/admin')
    await page.getByTestId('seed-attendees').fill('321')
    await page.getByTestId('seed-run').click()

    await expect(page.getByTestId('admin-task')).toContainText(/Reseeding/, { timeout: 15_000 })
    await expect(page.getByTestId('admin-task')).toContainText(/finished — 321 attendees/, { timeout: 150_000 })
    await expect(page.getByTestId('admin-attendees')).toHaveText('321')
  })
})
