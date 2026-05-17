// E2E: persistence cycle.
// Feature: 20260515-fix-calculos-financieros · TC-E-001 covers AC-1.1, AC-1.2, AC-1.3.
// Tests RED until T-015/T-016 (schema/migration), T-019 (incomeStore), T-027 (main.ts) land.

import { test, expect } from './fixtures'

test.describe('TC-E-001 — persistence cycle', () => {
  test('add debt + deduction → reload → both visible (AC-1.1, AC-1.2, AC-1.3)', async ({
    returningPage: page,
  }) => {
    // /debts: add a credit card.
    await page.goto('/debts')
    await page.getByRole('button', { name: /agregar|añadir|nuevo/i }).first().click()
    await page.getByLabel(/nombre/i).fill('Visa')
    await page.getByLabel(/saldo/i).fill('3000000')
    await page.getByLabel(/cupo|l[ií]mite/i).fill('10000000')
    await page.getByLabel(/tasa|apr|ea/i).fill('28')
    await page.getByLabel(/pago m[ií]nimo/i).fill('200000')
    await page.getByRole('button', { name: /guardar|crear|aceptar/i }).click()

    // /income: add a Salud 4% deduction.
    await page.goto('/income')
    await page.getByRole('button', { name: /agregar|añadir deducci[oó]n/i }).first().click()
    await page.getByLabel(/etiqueta|nombre/i).fill('Salud')
    await page.getByLabel(/monto|porcentaje/i).fill('4')
    // (percent toggle assumed default)
    await page.getByRole('button', { name: /guardar/i }).click()

    // Reload.
    await page.reload()

    // Assert: both entries present.
    await page.goto('/debts')
    await expect(page.getByText('Visa')).toBeVisible()

    await page.goto('/income')
    await expect(page.getByText(/Salud/)).toBeVisible()
  })
})
