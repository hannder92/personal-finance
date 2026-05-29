import { expect, test } from './fixtures'

test.describe('Mobile nav groups (TC-E-001)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('reaches goals in two taps from home', async ({ freshPage: page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Plan' }).click()
    await page.getByRole('link', { name: 'Metas' }).click()
    await expect(page).toHaveURL(/\/goals/)
  })
})
