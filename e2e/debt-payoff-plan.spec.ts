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
    await expect(page.getByTestId('prepayment-simulator')).toBeVisible()
    await page.getByTestId('prepayment-extra').fill('200000')
    await expect(page.getByTestId('prepayment-months-saved')).toContainText(/\d+/)
    await expect(page.getByTestId('prepayment-interest-saved')).toBeVisible()
  })

  test('a loan can be marked as libranza and the flag persists', async ({ page }) => {
    await page.context().addInitScript(
      (args: { key: string; state: string }) => {
        localStorage.setItem(args.key, args.state)
      },
      {
        key: STORAGE_KEY,
        state: minimalState({
          cards: [
            {
              id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
              name: 'Crédito nómina',
              type: 'loan',
              balance: 20_000_000,
              apr: 17,
              minPayment: 800_000,
              remainingInstallments: 30,
              installments: [],
            },
          ],
        }),
      }
    )
    await page.goto('/debts')
    await page.getByTestId('debt-payroll-toggle').check()
    await expect(page.getByTestId('debt-libranza-badge')).toBeVisible()
    // The init script re-seeds storage on reload, so read the persisted payload directly.
    await expect
      .poll(() =>
        page.evaluate((key) => {
          const saved = JSON.parse(localStorage.getItem(key) ?? '{}')
          return { version: saved.schemaVersion, flag: saved.cards?.[0]?.payrollDeducted }
        }, STORAGE_KEY)
      )
      .toEqual({ version: 6, flag: true })
  })
})
