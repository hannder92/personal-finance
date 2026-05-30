// E2E: health score recomputes when assets or housing expenses change.
// Feature: 20260515-fix-calculos-financieros · TC-E-003 covers AC-3.5, AC-3.6.
// Today the breakdown values are hardcoded — RED until T-022/T-028.

import { test, expect } from './fixtures'

test.describe('TC-E-003 — health score reactive', () => {
  test('add savings asset → emergency component value updates (AC-3.5)', async ({
    returningPage: page,
  }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /puntaje de salud/i }).click()
    const emergencyRow = page.locator('[data-component="emergency"]')
    await expect(emergencyRow).toBeVisible()
    const before = await emergencyRow.getAttribute('data-status')

    // Add asset via /networth.
    await page.goto('/networth')
    await page.getByLabel(/^nombre$/i).fill('Ahorro')
    await page.getByLabel(/^valor$/i).fill('6000000')
    await page.getByRole('button', { name: /^agregar$/i }).click()

    // Back to dashboard.
    await page.goto('/')
    await page.getByRole('button', { name: /puntaje de salud/i }).click()
    await expect(emergencyRow).toBeVisible()
    const after = await emergencyRow.getAttribute('data-status')
    expect(after).not.toBe(before)
  })

  test('add housing expense → housing component value updates (AC-3.6)', async ({
    returningPage: page,
  }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /puntaje de salud/i }).click()
    const housingRow = page.locator('[data-component="housing"]')
    await expect(housingRow).toBeVisible()
    const before = await housingRow.getAttribute('data-status')

    await page.goto('/expenses')
    await page.getByLabel(/nombre/i).fill('Arriendo')
    await page.getByLabel(/monto/i).fill('1500000')
    await page.getByRole('button', { name: /^agregar$/i }).click()

    await page.goto('/')
    await page.getByRole('button', { name: /puntaje de salud/i }).click()
    await expect(housingRow).toBeVisible()
    const after = await housingRow.getAttribute('data-status')
    expect(after).not.toBe(before)
  })
})
