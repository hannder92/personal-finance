// Feature: 20260516-sprint1-mejoras-finanzas · TC-E-003 (AC-5.1, AC-5.2)
// Verifies that the transport allowance suggestion banner shows for a qualifying
// salary and that accepting it adds the $200,000 benefit and hides the banner.

import { test, expect, minimalState } from './fixtures'

const STORAGE_KEY = 'finance_app_data'

test.describe('TC-E-003: Transport allowance suggestion', () => {
  test('AC-5.1/5.2: salary ≤ 2 SMMLV shows banner; accept adds $200.000 and hides it', async ({ page }) => {
    await page.context().addInitScript(
      (args: { key: string; state: string }) => {
        localStorage.setItem(args.key, args.state)
      },
      {
        key: STORAGE_KEY,
        state: minimalState({
          income: {
            grossSalary: 2_000_000,
            deductions: [],
            otherStreams: [],
            nonSalaryBenefits: [],
          },
        }),
      }
    )

    await page.goto('/income')

    const banner = page.getByTestId('transport-suggestion-banner')
    await expect(banner).toBeVisible()

    const acceptBtn = banner.getByRole('button', { name: /agregar.*\$200/i })
    await acceptBtn.click()

    await expect(banner).toBeHidden()
    await expect(page.getByText(/auxilio de transporte/i).first()).toBeVisible()
    await expect(page.getByText(/\$\s*200\.000|\$\s*200,000/)).toBeVisible()
  })
})
