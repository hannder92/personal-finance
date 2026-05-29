import { expect, test } from './fixtures'

// Fresh users land directly on the dashboard (no onboarding wizard).
test('TC-E-001: fresh session opens dashboard', async ({ freshPage: page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Resumen' })).toBeVisible({ timeout: 8000 })
  await expect(page.getByText(/salario bruto/i).first()).not.toBeVisible()
})
