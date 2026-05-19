// Feature: 20260516-sprint1-mejoras-finanzas · TC-E-001 (AC-1.1, AC-1.2, AC-1.4)
// Seeds invalid JSON in localStorage and verifies the load-error toast appears,
// remains visible without auto-dismiss, can be dismissed, and the app stays usable.

import { test, expect } from './fixtures'

const STORAGE_KEY = 'finance_app_data'

test.describe('TC-E-001: persistence load error flow', () => {
  test('AC-1.1/1.2/1.4: invalid JSON → notification → dismiss → /income reachable', async ({ page }) => {
    // Seed invalid JSON BEFORE the app loads so loadAppState surfaces parseError = invalid_json.
    await page.context().addInitScript(
      (args: { key: string }) => {
        localStorage.setItem(args.key, '{"broken":')
      },
      { key: STORAGE_KEY }
    )

    await page.goto('/')

    const toast = page.getByRole('alert')
    await expect(toast).toBeVisible()

    // AC-1.2: still visible after 5 seconds without interaction.
    await page.waitForTimeout(5000)
    await expect(toast).toBeVisible()

    // AC-1.4: dismiss removes the notification.
    const dismissBtn = page.getByRole('button', { name: /descart|dismiss/i })
    await dismissBtn.click()
    await expect(toast).toBeHidden()

    // App remains usable — /income loads without errors.
    await page.goto('/income')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })
})
