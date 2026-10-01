// Feature: 20260604-dashboard-progressive-disclosure · TC-E-030 … TC-E-036
import { expect, test } from './fixtures'

test.describe('Dashboard tier 2 — mobile (390×844)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('TC-E-030 (AC-1.1): tier 2 hidden by default', async ({ returningPage: page }) => {
    await page.goto('/')
    await expect(page.getByTestId('dashboard-tier-2')).not.toBeVisible()
    await expect(page.getByTestId('kpi-strip')).not.toBeVisible()
  })

  test('TC-E-032 (AC-2.2): expand reveals tier 2', async ({ returningPage: page }) => {
    await page.goto('/')
    await page.getByTestId('dashboard-tier2-toggle').click()
    await expect(page.getByTestId('dashboard-tier-2')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('kpi-strip')).toBeVisible()
  })

  test('TC-E-033 (AC-2.3): collapse hides tier 2', async ({ returningPage: page }) => {
    await page.goto('/')
    await page.getByTestId('dashboard-tier2-toggle').click()
    await expect(page.getByTestId('dashboard-tier-2')).toBeVisible()
    await page.getByRole('button', { name: 'Ocultar análisis' }).click()
    await expect(page.getByTestId('dashboard-tier-2')).not.toBeVisible()
  })

  test('TC-E-034 (AC-3.1): expanded state persists after navigation', async ({
    returningPage: page,
  }) => {
    await page.goto('/')
    await page.getByTestId('dashboard-tier2-toggle').click()
    await expect(page.getByTestId('dashboard-tier-2')).toBeVisible()
    await page.goto('/income')
    await page.goto('/')
    await expect(page.getByTestId('dashboard-tier-2')).toBeVisible()
  })

  test('TC-E-035 (AC-3.2): fresh page starts collapsed', async ({ freshPage: page }) => {
    await page.goto('/')
    await expect(page.getByTestId('dashboard-tier-2')).not.toBeVisible()
  })
})

test.describe('Dashboard tier 2 — desktop (1280×720)', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('TC-E-036 (AC-4.1, AC-4.2): tier 2 visible without toggle', async ({
    returningPage: page,
  }) => {
    await page.goto('/')
    await expect(page.getByTestId('dashboard-tier-2')).toBeVisible({ timeout: 8000 })
    await expect(page.getByTestId('dashboard-tier2-toggle')).not.toBeVisible()
    await expect(page.getByTestId('kpi-strip')).toBeVisible()
  })
})
