import { test, expect } from '@playwright/test'

/**
 * M3 baseline smoke — the app shell renders. Targets the current dashboard
 * (Venue Intelligence build); stays valid once wired to the live API.
 */
test.describe('Dashboard shell', () => {
  test('loads with header and default Overview', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Brimz/i)

    // Header venue selector
    await expect(page.getByText('Demo Arena')).toBeVisible()

    // Overview renders its energy visuals by default
    await expect(page.getByText('Energy Over Time')).toBeVisible()
  })

  test('primary nav sections + a key item are present', async ({ page }) => {
    await page.goto('/')
    for (const section of ['Venue Intelligence', 'Commercial']) {
      await expect(page.getByText(section, { exact: true }).first()).toBeVisible()
    }
    await expect(page.getByRole('button', { name: 'Fan Energy Index', exact: true })).toBeVisible()
  })
})
