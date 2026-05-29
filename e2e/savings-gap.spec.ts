import { expect, minimalState, test } from './fixtures'

const STORAGE_KEY = 'finance_app_data'

test.describe('Savings gap on dashboard (TC-E-010)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('shows objective 2M and feasible 800k with not viable alert', async ({ page }) => {
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
            otherStreams: [],
            nonSalaryBenefits: [],
          },
          expenses: [
            {
              id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
              name: 'Rent',
              amount: 8_000_000,
              category: 'vivienda',
            },
          ],
          cards: [
            {
              id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
              name: 'Card',
              type: 'card',
              balance: 1_000_000,
              limit: 2_000_000,
              apr: 24,
              minPayment: 1_200_000,
              dueDate: null,
              installments: [],
            },
          ],
          allocation: { needs: 50, wants: 30, savings: 20 },
        }),
      }
    )
    await page.goto('/')
    await expect(page.getByTestId('savings-gap-objective')).toContainText('2')
    await expect(page.getByTestId('savings-gap-feasible')).toContainText('800')
    await expect(page.getByRole('alert')).toBeVisible()
  })
})
