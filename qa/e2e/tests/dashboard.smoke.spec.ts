import { test, expect } from '@playwright/test'

/**
 * M3 smoke — the wired app shell renders real API data (runs as Admin).
 */
test.describe('Dashboard shell', () => {
  test('loads with header, venue from API, and default Overview', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Brimz/i)

    // Header venue selector now comes from GET /api/v1/venues (seeded name).
    await expect(page.getByText('Main Arena').first()).toBeVisible()

    // Overview renders its energy visuals from the API
    await expect(page.getByText('Energy Over Time')).toBeVisible()
    await expect(page.getByText(/Peak Energy: 98/)).toBeVisible()
  })

  test('primary nav sections are present', async ({ page }) => {
    await page.goto('/')
    for (const section of ['Venue Intelligence', 'Operations', 'Fans', 'Commercial', 'System']) {
      await expect(page.getByText(section, { exact: true }).first()).toBeVisible()
    }
    await expect(page.getByRole('link', { name: 'Fan Energy Index', exact: true })).toBeVisible()
  })

  test('settings page updates the profile name end-to-end', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible()
    const nameInput = page.locator('form').first().locator('input').first()
    // Round-trip: change the name, save, expect the success banner, restore.
    const original = await nameInput.inputValue()
    await nameInput.fill('Bennie B. (e2e)')
    await page.getByRole('button', { name: 'Save profile' }).click()
    await expect(page.getByRole('status')).toContainText('Profile saved')
    await nameInput.fill(original)
    await page.getByRole('button', { name: 'Save profile' }).click()
    await expect(page.getByRole('status')).toContainText('Profile saved')
  })
})
