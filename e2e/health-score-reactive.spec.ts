// E2E: health score recomputes when assets or housing expenses change.
// Feature: 20260515-fix-calculos-financieros · TC-E-003 covers AC-3.5, AC-3.6.
// Today the breakdown values are hardcoded — RED until T-022/T-028.

import { test, expect } from './fixtures'

test.describe('TC-E-003 — health score reactive', () => {
  test('add savings asset → emergency component value updates (AC-3.5)', async ({
    returningPage: page,
  }) => {
    await page.goto('/')
    // Capture initial emergency status (data-status or similar marker on the HealthScore breakdown).
    const emergencyRow = page.locator('[data-component="emergency"]')
    const before = await emergencyRow.getAttribute('data-status').catch(() => null)

    // Add asset via /networth.
    await page.goto('/networth')
    await page.getByRole('button', { name: /agregar|añadir activo/i }).first().click()
    await page.getByLabel(/nombre/i).fill('Ahorro')
    await page.getByLabel(/valor|monto/i).fill('6000000')
    await page.getByRole('button', { name: /guardar/i }).click()

    // Back to dashboard.
    await page.goto('/')
    const after = await emergencyRow.getAttribute('data-status').catch(() => null)
    expect(after).not.toBe(before)
  })

  test('add housing expense → housing component value updates (AC-3.6)', async ({
    returningPage: page,
  }) => {
    await page.goto('/')
    const housingRow = page.locator('[data-component="housing"]')
    const before = await housingRow.getAttribute('data-status').catch(() => null)

    await page.goto('/expenses')
    await page.getByRole('button', { name: /agregar|añadir gasto/i }).first().click()
    await page.getByLabel(/nombre/i).fill('Arriendo')
    await page.getByLabel(/monto/i).fill('1500000')
    await page.getByLabel(/categor[íi]a/i).selectOption({ label: /vivienda/i })
    await page.getByRole('button', { name: /guardar/i }).click()

    await page.goto('/')
    const after = await housingRow.getAttribute('data-status').catch(() => null)
    expect(after).not.toBe(before)
  })
})
