// Feature: 20260530-mi-dia-cobertura · TC-E-024
import { expect, minimalState, test } from './fixtures'

const STORAGE_KEY = 'finance_app_data'

function todayKey(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

test.describe('TC-E-024 — Mi Día on dashboard (AC-1.1, AC-2.2, AC-4.1)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('coverage badge visible above fold; debts link works', async ({ page }) => {
    const due = todayKey()
    await page.context().addInitScript(
      (args: { key: string; state: string }) => {
        localStorage.setItem(args.key, args.state)
      },
      {
        key: STORAGE_KEY,
        state: minimalState({
          income: {
            grossSalary: 5_000_000,
            deductions: [],
            otherStreams: [],
            nonSalaryBenefits: [],
          },
          cards: [
            {
              id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
              type: 'card',
              name: 'Visa',
              balance: 0,
              limit: 2_000_000,
              apr: 0,
              minPayment: 200_000,
              dueDate: due,
              installments: [],
            },
          ],
          assets: [
            {
              id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
              name: 'Efectivo',
              value: 800_000,
              type: 'cash',
              annualRatePercent: 0,
            },
          ],
        }),
      }
    )

    await page.goto('/')
    const overview = page.getByTestId('data-day-overview')
    await expect(overview).toBeVisible({ timeout: 10_000 })

    const badge = page.locator('[data-coverage-status="covered"]')
    await expect(badge).toBeVisible()
    const box = await badge.boundingBox()
    expect(box).toBeTruthy()
    expect(box!.y).toBeLessThan(844)

    const hero = page.getByTestId('data-dashboard-hero')
    const overviewBox = await overview.boundingBox()
    const heroBox = await hero.boundingBox()
    expect(overviewBox!.y).toBeLessThan(heroBox!.y)

    await page.getByTestId('data-link-debts').click()
    await expect(page).toHaveURL(/\/debts/)
  })
})
