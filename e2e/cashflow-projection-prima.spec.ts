import { expect, minimalState, test } from './fixtures'

const STORAGE_KEY = 'finance_app_data'

test.describe('Cashflow projection prima spikes (TC-E-011)', () => {
  test('projection chart reflects semiannual income spike', async ({ page }) => {
    await page.context().addInitScript(
      (args: { key: string; state: string }) => {
        localStorage.setItem(args.key, args.state)
      },
      {
        key: STORAGE_KEY,
        state: minimalState({
          income: {
            grossSalary: 10_000_000,
            deductions: [],
            otherStreams: [
              {
                id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
                label: 'Prima',
                amount: 6_000_000,
                frequency: 'semiannual',
              },
            ],
            nonSalaryBenefits: [],
          },
        }),
      }
    )
    await page.goto('/')
    const chart = page.getByTestId('projection-chart')
    await expect(chart).toBeVisible()
    const month7 = await chart.getAttribute('data-month-7-balance')
    const month6 = await chart.getAttribute('data-month-6-balance')
    expect(Number(month7)).toBeGreaterThan(Number(month6))
  })
})
