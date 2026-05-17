// E2E: prima de servicios button creates + upserts + persists.
// Feature: 20260515-fix-calculos-financieros · TC-E-004 covers AC-7.1, AC-7.2, AC-7.3.
// Today the prima button returns early on second press — RED until T-019.

import { test, expect, minimalState } from './fixtures'

const STORAGE_KEY = 'finance_app_data'

test.describe('TC-E-004 — prima upsert + persistence', () => {
  test('button creates, second press updates, persists across reload', async ({ page }) => {
    await page.context().addInitScript(
      (args: { key: string; state: string }) => {
        localStorage.setItem(args.key, args.state)
      },
      {
        key: STORAGE_KEY,
        state: minimalState({
          income: {
            grossSalary: 12_000_000,
            deductions: [],
            otherStreams: [],
            nonSalaryBenefits: [],
          },
        }),
      }
    )
    await page.goto('/income')

    // Press "Cargar prima de servicios".
    await page.getByRole('button', { name: /prima de servicios/i }).click()

    // Assert: one semiannual stream of $6.000.000 appears.
    await expect(page.getByText(/prima de servicios/i)).toBeVisible()
    await expect(page.getByText(/6[.,]?000[.,]?000|6 000 000/)).toBeVisible()

    // Second press: should NOT duplicate.
    await page.getByRole('button', { name: /prima de servicios/i }).click()
    const primaCount = await page.getByText(/prima de servicios/i).count()
    expect(primaCount).toBe(1)

    // Reload and re-check.
    await page.reload()
    await expect(page.getByText(/prima de servicios/i)).toBeVisible()
    await expect(page.getByText(/6[.,]?000[.,]?000|6 000 000/)).toBeVisible()
  })
})
