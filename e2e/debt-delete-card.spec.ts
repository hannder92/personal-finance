// Feature: 20260529-metricas-runway-ingresos · T-022 RED — GREEN after T-041
import { expect, minimalState, test } from './fixtures'

const STORAGE_KEY = 'finance_app_data'

test.describe('TC-E-022 — delete debt from card (AC-5.3)', () => {
  test('in-card delete icon opens confirm and removes debt', async ({ page }) => {
    await page.context().addInitScript(
      (args: { key: string; state: string }) => {
        localStorage.setItem(args.key, args.state)
      },
      {
        key: STORAGE_KEY,
        state: minimalState({
          cards: [
            {
              id: '11111111-1111-4111-8111-111111111111',
              type: 'card',
              name: 'Visa',
              balance: 1_000_000,
              limit: 5_000_000,
              apr: 24,
              minPayment: 100_000,
              dueDate: null,
              installments: [],
            },
          ],
        }),
      }
    )

    await page.goto('/debts')
    await page.getByTestId('debt-delete-btn').first().click()
    await page.getByRole('button', { name: /confirmar|confirm/i }).click()
    await expect(page.getByTestId('debt-delete-btn')).toHaveCount(0)
  })
})
