// Feature: 20260529-metricas-runway-ingresos · T-022 RED — GREEN after T-040
import { expect, SEED_ONCE_INIT_SCRIPT, seedStorageOnce, test } from './fixtures'

test.describe('TC-E-021 — income class persists (AC-3.2)', () => {
  test('passive class survives page reload', async ({ page }) => {
    await page.context().addInitScript(
      SEED_ONCE_INIT_SCRIPT,
      seedStorageOnce({
        income: {
          grossSalary: 5_000_000,
          deductions: [],
          otherStreams: [],
          nonSalaryBenefits: [],
        },
      })
    )

    await page.goto('/income')
    await page.getByRole('button', { name: '+ Agregar' }).nth(1).click()
    await page.getByLabel(/nombre|label/i).fill('Renta')
    await page.getByTestId('income-class-select').selectOption('passive')
    await page.getByRole('button', { name: /guardar|save/i }).click()

    await page.reload()
    await expect(page.getByTestId('income-class-select')).toHaveValue('passive')
  })
})
