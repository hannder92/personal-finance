import { expect, test } from './fixtures'

// TC-E-005: AC-5.1, AC-5.3
// Payoff simulator lives in the Debts section.
test('TC-E-005: /debts section loads without error', async ({ returningPage: page }) => {
  await page.goto('/debts')
  await expect(page.getByText('Deudas').first()).toBeVisible({ timeout: 5000 })
})

test('TC-E-005: card utilization bar visible when cards exist in store', async ({
  freshPage: page,
}) => {
  // Seed with schema-compliant state: dueDate is day number 1-31 (NOT a string/null).
  await page.context().addInitScript(() => {
    const state = {
      schemaVersion: 2,
      settings: {
        lang: 'es',
        currency: 'COP',
        theme: 'system',
        payoffMethod: 'avalanche',
        onboarding: { done: true, currentStep: 0 },
        lastMonthSeen: null,
      },
      income: { grossSalary: 5_000_000, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
      expenses: [],
      cards: [
        {
          id: '11111111-1111-4111-8111-111111111111',
          type: 'card',
          name: 'Visa Oro',
          balance: 2_000_000,
          limit: 5_000_000,
          apr: 24,
          minPayment: 100_000,
          dueDate: 15,
          installments: [],
        },
      ],
      goals: [],
      assets: [],
      variableExpenses: [],
      snapshots: [],
      allocation: { needs: 50, wants: 30, savings: 20 },
    }
    localStorage.setItem('finance_app_data', JSON.stringify(state))
  })
  await page.goto('/debts')
  await expect(page.getByRole('progressbar').first()).toBeVisible({ timeout: 5000 })
})
