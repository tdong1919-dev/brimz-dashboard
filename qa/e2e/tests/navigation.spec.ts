import { test, expect } from '@playwright/test'

/**
 * M3 navigation sweep — every sidebar route renders its page heading.
 * All 24 views are reachable via React Router URLs (runs as Admin).
 */
const PAGES: Array<[nav: string, path: string, heading: string]> = [
  ['Crowd Insights', '/crowd-insights', 'Crowd Insights'],
  ['Fan Energy Index', '/fan-energy', 'Fan Energy Index'],
  ['Heat Maps', '/heatmaps', 'Heat Maps'],
  ['Theme Nights', '/theme-nights', 'Theme Nights'],
  ['Sponsor Intelligence', '/sponsor-intelligence', 'Sponsor Intelligence'],
  ['Emotional Peaks', '/emotional-peaks', 'Emotional Peaks'],
  ['Event Comparison', '/event-comparison', 'Event Comparison'],
  ['Executive Insights', '/executive-insights', 'Executive Insights'],
  ['Event Management', '/events', 'Event Management'],
  ['Performance', '/performance', 'Performance'],
  ['Alerts', '/alerts', 'Alerts'],
  ['Devices & Inventory', '/devices', 'Devices & Inventory'],
  ['Venue Profile', '/venue', 'Venue Profile'],
  ['Staff & Access', '/staff', 'Staff & Access'],
  ['Integrations', '/integrations', 'Integrations'],
  ['Fan Engagement', '/fan-engagement', 'Fan Engagement'],
  ['Fan Segmentation', '/fan-segmentation', 'Fan Segmentation'],
  ['Content & UGC', '/content', 'Content & UGC'],
  ['Revenue', '/revenue', 'Revenue'],
  ['Sponsorship ROI', '/sponsorship-roi', 'Sponsorship ROI'],
  ['Campaigns', '/campaigns', 'Campaigns'],
  ['Reporting', '/reporting', 'Reporting'],
  ['Billing', '/billing', 'Venue Intelligence Pricing'],
  ['Settings', '/settings', 'Settings'],
]

for (const [nav, path, heading] of PAGES) {
  test(`sidebar link "${nav}" routes to ${path}`, async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: nav, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${path}$`))
    await expect(page.getByRole('heading', { level: 1, name: heading, exact: true })).toBeVisible()
  })
}

test('deep-linking straight to a page works (browser URL is real)', async ({ page }) => {
  await page.goto('/revenue')
  await expect(page.getByRole('heading', { level: 1, name: 'Revenue', exact: true })).toBeVisible()
})

test('Admin appears in the sidebar for the Admin role and routes', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Admin', exact: true }).click()
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole('heading', { level: 1, name: /Admin — Stadium Simulation/ })).toBeVisible()
})
