// E2E: dashboard metrics use net income (not gross).
// Feature: 20260515-fix-calculos-financieros · TC-E-002 covers AC-2.2.
// Today DashboardView reads income.state.grossSalary directly — RED until T-028.

import { test, expect, SEED_ONCE_INIT_SCRIPT, seedStorageOnce } from './fixtures'

test.describe('TC-E-002 — dashboard uses net income', () => {
  test('gross 12.1M + 4% salud + 4% pensión → distribution amounts show $11.132.000 (AC-2.2)', async ({
    page,
  }) => {
    await page.context().addInitScript(
      SEED_ONCE_INIT_SCRIPT,
      seedStorageOnce({
        income: {
          grossSalary: 12_100_000,
          deductions: [
            {
              id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
              label: 'Salud',
              amount: 4,
              type: 'percent',
            },
            {
              id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
              label: 'Pensión',
              amount: 4,
              type: 'percent',
            },
          ],
          otherStreams: [],
          nonSalaryBenefits: [],
        },
      })
    )
    await page.goto('/')

    const kpiStrip = page.getByTestId('kpi-strip')
    await expect(kpiStrip).toBeVisible({ timeout: 5000 })
    await expect(kpiStrip).toContainText(/11[.,\s]?132[.,\s]?000/)
  })
})
