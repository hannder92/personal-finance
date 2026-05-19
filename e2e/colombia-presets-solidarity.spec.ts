// Feature: 20260516-sprint1-mejoras-finanzas · TC-E-002 (AC-4.1, AC-4.3)
// Verifies that applying Colombia presets at gross 8M adds the solidarity fund,
// and a second apply does not duplicate it.

import { test, expect, minimalState } from './fixtures'

const STORAGE_KEY = 'finance_app_data'

test.describe('TC-E-002: Colombia presets — solidarity fund', () => {
  test('AC-4.1/4.3: salary 8M adds solidarity once; second apply is idempotent', async ({ page }) => {
    await page.context().addInitScript(
      (args: { key: string; state: string }) => {
        localStorage.setItem(args.key, args.state)
      },
      {
        key: STORAGE_KEY,
        state: minimalState({
          income: {
            grossSalary: 8_000_000,
            deductions: [],
            otherStreams: [],
            nonSalaryBenefits: [],
          },
        }),
      }
    )

    await page.goto('/income')

    const presetBtn = page.getByRole('button', { name: /cargar.*colombia/i }).first()
    await presetBtn.click()

    // AC-4.1: solidarity appears.
    await expect(page.getByText(/fondo.*solidaridad/i)).toBeVisible()

    // AC-4.3: clicking again does NOT duplicate.
    await presetBtn.click()
    const matches = page.getByText(/fondo.*solidaridad/i)
    await expect(matches).toHaveCount(1)
  })
})
