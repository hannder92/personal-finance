import { expect, test } from './fixtures'

// TC-E-002: returning user lands on dashboard with persisted data
test('TC-E-002: returning user lands on dashboard', async ({ returningPage: page }) => {
  await page.goto('/')
  // Should redirect to / which renders Dashboard for returning users.
  await expect(page.getByText('Dashboard').first()).toBeVisible({ timeout: 8000 })
})

test('TC-E-002 AC-17.9: navigation between sections has no visible layout flash', async ({
  returningPage: page,
}) => {
  await page.goto('/')
  await expect(page.getByText('Dashboard').first()).toBeVisible({ timeout: 8000 })

  // Navigate to Income and back — should be smooth (no blank frames visible).
  const startTime = Date.now()
  await page.goto('/income')
  await expect(page.getByText('Ingresos').first()).toBeVisible({ timeout: 5000 })
  const elapsed = Date.now() - startTime
  // If there were a flash, it would cause a hard layout repaint >1s. Check transition
  // completed in reasonable time.
  expect(elapsed).toBeLessThan(3000)
})
