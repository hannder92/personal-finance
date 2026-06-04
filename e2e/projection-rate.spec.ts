// Feature: 20260529-metricas-runway-ingresos · T-022 RED — GREEN after T-042
import { expect, SEED_ONCE_INIT_SCRIPT, seedStorageOnce, test } from './fixtures'

test.describe('TC-E-023 — projection TEA persists (AC-6.2)', () => {
  test('projection rate input persists after reload', async ({ page }) => {
    await page.context().addInitScript(
      SEED_ONCE_INIT_SCRIPT,
      seedStorageOnce({
        assets: [
          {
            id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
            name: 'Ahorros',
            value: 10_000_000,
            type: 'savings',
            annualRatePercent: 0,
          },
        ],
      })
    )

    await page.goto('/')
    const rateInput = page.getByTestId('projection-rate-input')
    await expect(rateInput).toBeVisible()
    await rateInput.fill('10')
    await rateInput.blur()

    await page.reload()
    await expect(page.getByTestId('projection-rate-input')).toHaveValue('10')
  })
})
