import { expect, test } from './fixtures'

test.describe('Financial freedom navigation (TC-E-013)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('compact block links to detail view', async ({ returningPage: page }) => {
    await page.goto('/')
    // Tier-2 is collapsed by default on mobile (20260604-dashboard-progressive-disclosure).
    await page.getByTestId('dashboard-tier2-toggle').click()
    await expect(page.getByTestId('financial-freedom-compact')).toBeVisible()
    await page.getByRole('link', { name: /ver detalle|view details/i }).click()
    await expect(page).toHaveURL(/\/financial-freedom/)
    await expect(page.getByTestId('fi-living-expense')).toBeVisible()
  })
})
