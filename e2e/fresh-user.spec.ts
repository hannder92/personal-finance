import { expect, test } from './fixtures'

// Fresh users land directly on the dashboard (no onboarding wizard).
test('TC-E-001: fresh session opens dashboard', async ({ freshPage: page }) => {
  await page.goto('/')
  // Since 20260609-dashboard-fintech-redesign the dashboard heading is the greeting.
  await expect(page.getByTestId('dashboard-greeting')).toBeVisible({ timeout: 8000 })
  await expect(page.getByText(/salario bruto/i).first()).not.toBeVisible()
})
