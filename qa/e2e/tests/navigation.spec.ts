import { test, expect } from '@playwright/test'

/**
 * M3 navigation smoke — each sidebar item routes to its page and renders the
 * matching <h1>. Overview is excluded (no PageHeader/h1). Driven by the nav in
 * src/components/Sidebar.tsx and the PageHeader titles per page (Venue
 * Intelligence build).
 */
const PAGES: Array<[nav: string, heading: string]> = [
  ['Fan Energy Index', 'Fan Energy Index'],
  ['Heat Maps', 'Heat Maps'],
  ['Theme Nights', 'Theme Nights'],
  ['Sponsor Intelligence', 'Sponsor Intelligence'],
  ['Emotional Peaks', 'Emotional Peaks'],
  ['Event Comparison', 'Event Comparison'],
  ['Executive Insights', 'Executive Insights'],
  ['Billing', 'Venue Intelligence Pricing'],
]

for (const [nav, heading] of PAGES) {
  test(`navigates to "${nav}"`, async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: nav, exact: true }).click()
    await expect(page.getByRole('heading', { level: 1, name: heading, exact: true })).toBeVisible()
  })
}
