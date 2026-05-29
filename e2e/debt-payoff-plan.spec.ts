import { expect, minimalState, test } from './fixtures'

const STORAGE_KEY = 'finance_app_data'

test.describe('Debt payoff plan UI (TC-E-012)', () => {
  test('shows debt-free date and simulator results', async ({ page }) => {
    await page.context().addInitScript(
      (args: { key: string; state: string }) => {
        localStorage.setItem(args.key, args.state)
      },
      {
        key: STORAGE_KEY,
        state: minimalState({
          cards: [
            {
              id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
              name: 'Visa',
              type: 'card',
              balance: 2_000_000,
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
    await expect(page.getByTestId('debt-payoff-date')).toBeVisible()
    await page.getByLabel(/pago extra|extra payment/i).fill('200000')
    await page.getByRole('button', { name: /simular|simulate/i }).click()
    await expect(page.getByTestId('payoff-months-saved')).not.toHaveText('0')
  })
})
