import { expect, test } from './fixtures'

// TC-E-007: AC-13.1 (Month rollover → snapshot prompt)
// Full snapshot-rollover requires useMonthRollover composable (T-072 DoD deferred).
// This test verifies the history view shows snapshots when pre-seeded.
test('TC-E-007: /history shows snapshot list when snapshots exist in store', async ({
  freshPage: page,
}) => {
  // SnapshotSchema requires: id(uuid), month(YYYY-MM), capturedAt(datetime),
  // netIncome, totalFixedExpenses, totalVariableSpent, totalDebt, dti, savingsRate, netWorth, healthScore
  await page.context().addInitScript(() => {
    const state = {
      schemaVersion: 2,
      settings: {
        lang: 'es',
        currency: 'COP',
        theme: 'system',
        payoffMethod: 'avalanche',
        onboarding: { done: true, currentStep: 0 },
        lastMonthSeen: '2026-04',
      },
      income: { grossSalary: 5000000, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
      expenses: [],
      cards: [],
      goals: [],
      assets: [],
      variableExpenses: [],
      snapshots: [
        {
          id: '22222222-2222-4222-8222-222222222222',
          capturedAt: '2026-04-01T00:00:00.000Z',
          month: '2026-04',
          netIncome: 4500000,
          totalFixedExpenses: 1000000,
          totalVariableSpent: 200000,
          totalDebt: 500000,
          dti: 11.1,
          savingsRate: 15,
          netWorth: 5000000,
          healthScore: 72,
        },
      ],
      allocation: { needs: 50, wants: 30, savings: 20 },
    }
    localStorage.setItem('finance_app_data', JSON.stringify(state))
  })
  await page.goto('/history')
  await expect(page.getByText('2026-04').first()).toBeVisible({ timeout: 5000 })
})
