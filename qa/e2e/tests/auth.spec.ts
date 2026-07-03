import { test, expect } from '@playwright/test'

/**
 * M3 auth flow — runs with a clean (unauthenticated) context.
 */
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Login', () => {
  test('unauthenticated visit redirects to /login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('bad credentials show an error and stay on login', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('you@venue.com').fill('owner@brimz.tech')
    await page.getByPlaceholder('••••••••').fill('definitely-wrong')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('alert')).toContainText(/invalid email or password/i)
    await expect(page).toHaveURL(/\/login$/)
  })

  test('good credentials land on Overview; logout returns to login', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('you@venue.com').fill(process.env.E2E_ADMIN_EMAIL || 'owner@brimz.tech')
    await page.getByPlaceholder('••••••••').fill(process.env.E2E_ADMIN_PASSWORD || 'brimz-admin')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible()

    await page.getByTestId('user-menu').click()
    await page.getByTestId('logout').click()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('deep link is preserved through the login redirect', async ({ page }) => {
    await page.goto('/revenue')
    await expect(page).toHaveURL(/\/login$/)
    await page.getByPlaceholder('you@venue.com').fill(process.env.E2E_ADMIN_EMAIL || 'owner@brimz.tech')
    await page.getByPlaceholder('••••••••').fill(process.env.E2E_ADMIN_PASSWORD || 'brimz-admin')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/revenue$/)
  })
})
