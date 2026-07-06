import { test, expect } from '@playwright/test'

/**
 * The live playback promise: the dashboard visibly advances on its own, and an
 * Admin can freeze it at a moment. Runs as Admin (storage state from setup).
 */

test.describe('Live playback', () => {
  test.beforeEach(async ({ page }) => {
    // Make sure playback is looping before each check.
    await page.goto('/admin')
    await page.getByTestId('play').click()
    await expect(page.getByTestId('playback-mode')).toHaveText(/live/i)
  })

  test('Overview shows the LIVE badge and heatmap live tab', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('live-badge')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId('heatmap-label')).toContainText('LIVE')
  })

  test('playhead advances between ticks (the dashboard is alive)', async ({ page }) => {
    await page.goto('/admin')
    const playhead = page.getByTestId('playhead')
    await expect(playhead).not.toHaveText('—', { timeout: 10_000 })
    const first = await playhead.textContent()
    // Default loop = 5 min for a 5 h window → ~1 event-minute per wall-second.
    await expect(playhead).not.toHaveText(first!, { timeout: 15_000 })
  })

  test('seeking to the peak freezes the whole stadium at 98K', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByTestId('playhead')).not.toHaveText('—', { timeout: 10_000 })

    // Jump to the seeded peak moment (Encore – "Thunder", 8:24 PM).
    await page.getByRole('button', { name: /Encore/ }).click()
    await expect(page.getByTestId('playback-mode')).toHaveText(/seek/i)
    await expect(page.getByTestId('playhead')).toHaveText('8:24 PM', { timeout: 10_000 })
    await expect(page.getByTestId('total-energy')).toHaveText('98.0K', { timeout: 10_000 })

    // Frozen: still the same after more than a tick.
    await page.waitForTimeout(3_000)
    await expect(page.getByTestId('playhead')).toHaveText('8:24 PM')

    // Back to live for the rest of the suite.
    await page.getByTestId('play').click()
    await expect(page.getByTestId('playback-mode')).toHaveText(/live/i)
  })
})
