// E2E: month close on app open (ADR-7, AC-8.4, AC-13.1).
// A stored lastMonthSeen in the past → snapshot of that month + variable spending reset.

import { test, expect, seedStorageOnce, SEED_ONCE_INIT_SCRIPT } from './fixtures'

const STORAGE_KEY = 'finance_app_data'

test('opening the app in a new month saves a snapshot and resets variable spending', async ({
  page,
}) => {
  await page.context().addInitScript(
    SEED_ONCE_INIT_SCRIPT,
    seedStorageOnce({
      settings: {
        lang: 'es',
        currency: 'COP',
        theme: 'system',
        payoffMethod: 'avalanche',
        onboarding: { done: true, currentStep: 0, totalSteps: 3 },
        lastMonthSeen: '2020-01',
      },
      variableExpenses: [
        {
          id: '11111111-1111-4111-8111-111111111111',
          name: 'Mercado',
          budget: 800000,
          spent: 450000,
          icon: 'cart',
        },
      ],
    })
  )

  await page.goto('/history')
  await expect(page.locator('[data-month="2020-01"]')).toBeVisible()

  const stored = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? '{}'),
    STORAGE_KEY
  )
  expect(stored.snapshots).toHaveLength(1)
  expect(stored.snapshots[0]).toMatchObject({ month: '2020-01', totalVariableSpent: 450000 })
  expect(stored.variableExpenses[0]).toMatchObject({ budget: 800000, spent: 0 })
  expect(stored.settings.lastMonthSeen).not.toBe('2020-01')

  // Reload in the same month: no second snapshot.
  await page.reload()
  await expect(page.locator('[data-month]')).toHaveCount(1)
})
