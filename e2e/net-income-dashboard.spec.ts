// E2E: dashboard metrics use net income (not gross).
// Feature: 20260515-fix-calculos-financieros · TC-E-002 covers AC-2.2.
// Today DashboardView reads income.state.grossSalary directly — RED until T-028.

import { test, expect, minimalState } from './fixtures'

const STORAGE_KEY = 'finance_app_data'

test.describe('TC-E-002 — dashboard uses net income', () => {
  test('gross 12.1M + 4% salud + 4% pensión → distribution amounts show $11.132.000 (AC-2.2)', async ({
    page,
  }) => {
    await page.context().addInitScript(
      (args: { key: string; state: string }) => {
        localStorage.setItem(args.key, args.state)
      },
      {
        key: STORAGE_KEY,
        state: minimalState({
          income: {
            grossSalary: 12_100_000,
            deductions: [
              { id: 'd-1', label: 'Salud', amount: 4, type: 'percent' },
              { id: 'd-2', label: 'Pensión', amount: 4, type: 'percent' },
            ],
            otherStreams: [],
            nonSalaryBenefits: [],
          },
        }),
      }
    )
    await page.goto('/')

    // Net income should appear formatted as Colombian pesos somewhere on the dashboard.
    await expect(page.getByText(/\$\s?11[.,]?132[.,]?000|\$\s?11\s?132\s?000/)).toBeVisible({
      timeout: 5000,
    })
  })
})
