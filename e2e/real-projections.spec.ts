// Feature: 20261002-proyecciones-reales · T-012
import { expect, SEED_ONCE_INIT_SCRIPT, seedStorageOnce, test } from './fixtures'

const goal = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  name: 'Casa',
  target: 100_000_000,
  saved: 20_000_000,
  monthlyContrib: 1_500_000,
  targetDate: '2031-10-15',
  priority: 0,
}

test.describe('proyecciones reales', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addInitScript(
      SEED_ONCE_INIT_SCRIPT,
      seedStorageOnce({
        expenses: [
          {
            id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
            name: 'Arriendo',
            amount: 2_000_000,
            category: 'vivienda',
          },
        ],
        assets: [
          {
            id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
            name: 'Ahorros',
            value: 10_000_000,
            type: 'savings',
            annualRatePercent: 0,
          },
        ],
        goals: [goal],
      })
    )
  })

  test('TC-E-001 (AC-1.2, AC-1.6): reference values apply and persist', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByTestId('assumptions-suggestion')).toBeVisible()
    await page.getByTestId('assumptions-use-reference').click()
    await expect(page.getByTestId('assumptions-source')).toContainText('DANE')
    await page.reload()
    await expect(page.getByTestId('assumption-inflation')).toHaveValue('5')
    await expect(page.getByTestId('assumption-return')).toHaveValue('9')
    await expect(page.getByTestId('assumption-withdrawal')).toHaveValue('4')
  })

  test('TC-E-002 (AC-2.3, AC-2.7): FI hero and required monthly visible on mobile', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/settings')
    await page.getByTestId('assumptions-use-reference').click()
    await page.goto('/financial-freedom')
    await expect(page.getByTestId('fi-horizon')).toBeInViewport()
    await expect(page.getByTestId('fi-required')).toBeInViewport()
    await page.getByTestId('fi-desired-years').fill('10')
    await page.reload()
    await expect(page.getByTestId('fi-desired-years')).toHaveValue('10')
    await expect(page.getByTestId('fi-required')).toContainText('10 años')
  })

  test('TC-E-003 (AC-3.1, AC-3.5, AC-3.7): invest toggle changes status and persists', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/settings')
    await page.getByTestId('assumptions-use-reference').click()
    await page.goto('/goals')
    const toggle = page.getByTestId('goal-invested-toggle')
    await expect(toggle).not.toBeChecked()
    await expect(page.getByTestId('goal-estimated')).toBeInViewport()
    await expect(page.getByTestId('goal-required')).toBeInViewport()
    await toggle.check()
    await expect(page.getByTestId('goal-benefit')).toBeVisible()
    await page.reload()
    await expect(page.getByTestId('goal-invested-toggle')).toBeChecked()
  })
})
