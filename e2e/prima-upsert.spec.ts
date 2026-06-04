// E2E: prima de servicios button creates + upserts + persists.
// Feature: 20260515-fix-calculos-financieros · TC-E-004 covers AC-7.1, AC-7.2, AC-7.3.

import { test, expect, SEED_ONCE_INIT_SCRIPT, seedStorageOnce } from './fixtures'

test.describe('TC-E-004 — prima upsert + persistence', () => {
  test('button creates, second press updates, persists across reload', async ({ page }) => {
    await page.context().addInitScript(
      SEED_ONCE_INIT_SCRIPT,
      seedStorageOnce({
        income: {
          grossSalary: 12_000_000,
          deductions: [],
          otherStreams: [],
          nonSalaryBenefits: [],
        },
      })
    )
    await page.goto('/income')

    await expect(page.getByRole('button', { name: /prima de servicios/i })).toBeVisible()
    await page.getByRole('button', { name: /prima de servicios/i }).click()

    // Semiannual $6M → ≈ $1M/mes in stream row.
    await expect(
      page.locator('span.font-medium').filter({ hasText: /^Prima de servicios$/i })
    ).toBeVisible()
    await expect(page.getByText(/1[.,]?000[.,]?000|1 000 000/)).toBeVisible()

    await page.getByRole('button', { name: /prima de servicios/i }).click()
    await expect(
      page.locator('span.font-medium').filter({ hasText: /^Prima de servicios$/i })
    ).toHaveCount(1)

    await page.reload()
    await expect(
      page.locator('span.font-medium').filter({ hasText: /^Prima de servicios$/i })
    ).toBeVisible()
    await expect(page.getByText(/1[.,]?000[.,]?000|1 000 000/)).toBeVisible()
  })
})
