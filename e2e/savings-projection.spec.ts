// E2E: SavingsProjectionChart renders both series on the dashboard.
// Feature: 20260515-fix-calculos-financieros · TC-E-005 covers AC-8.1, AC-8.2, AC-8.3.
// Today the chart is a stub — RED until T-018, T-020, T-025, T-029 land.
// Performance note: frame-budget assertion (< 16ms) was intentionally NOT included
// per finance-test-engineer review (jitter on CI makes it flaky).

import { test, expect, SEED_ONCE_INIT_SCRIPT, seedStorageOnce } from './fixtures'

test.describe('TC-E-005 — savings projection chart', () => {
  test('two series visible with month 12 values reflecting both projections', async ({ page }) => {
    await page.context().addInitScript(
      SEED_ONCE_INIT_SCRIPT,
      seedStorageOnce({
        income: {
          grossSalary: 10_000_000,
          deductions: [],
          otherStreams: [],
          nonSalaryBenefits: [],
        },
        allocation: { needs: 50, wants: 30, savings: 20 },
        assets: [
          {
            id: '11111111-1111-4111-8111-111111111111',
            name: 'CDT',
            value: 5_000_000,
            type: 'savings',
            annualRatePercent: 10,
          },
        ],
      })
    )
    await page.goto('/')

    await page.getByTestId('projection-rate-input').fill('10')

    const chart = page.getByTestId('savings-projection-chart')
    await expect(chart).toBeVisible()

    // 2 datasets advertised.
    await expect(chart).toHaveAttribute('data-series-count', '2')

    // Hypothetical month 12: 10M × 20% × 12 = 24M.
    const hypoFinal = await chart.getAttribute('data-hypothetical-final')
    expect(Number(hypoFinal)).toBe(24_000_000)

    // Compound month 12: ≈ 5M × (1.10)^1 ≈ 5.5M (within 1% tolerance).
    const compoundFinal = Number(await chart.getAttribute('data-compound-final'))
    expect(compoundFinal).toBeGreaterThan(5_400_000)
    expect(compoundFinal).toBeLessThan(5_600_000)
  })
})
