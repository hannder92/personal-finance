// Feature: 20260529-metricas-runway-ingresos · T-022 RED — GREEN after T-038
import { expect, minimalState, test } from './fixtures'

const STORAGE_KEY = 'finance_app_data'

test.describe('TC-E-020 — runway on dashboard (AC-1.1)', () => {
  test('runway card visible with numeric months KPI', async ({ page }) => {
    await page.context().addInitScript(
      (args: { key: string; state: string }) => {
        localStorage.setItem(args.key, args.state)
      },
      {
        key: STORAGE_KEY,
        state: minimalState({
          assets: [
            {
              id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
              name: 'Ahorros',
              value: 30_000_000,
              type: 'savings',
              annualRatePercent: 0,
            },
          ],
          expenses: [
            {
              id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
              name: 'Vida',
              amount: 5_000_000,
              category: 'other',
            },
          ],
        }),
      }
    )

    await page.goto('/')
    await expect(page.getByTestId('runway-card')).toBeVisible()
    await expect(page.getByTestId('runway-months')).toBeVisible()
    await expect(page.getByTestId('runway-months')).toContainText(/6/)
  })
})
