import { expect, test } from './fixtures'

test.describe('Dashboard hero mobile (TC-E-002)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('hero available is visible without scrolling', async ({ freshPage: page }) => {
    await page.goto('/')
    const hero = page.getByTestId('hero-available')
    await expect(hero).toBeVisible({ timeout: 8000 })
    const box = await hero.boundingBox()
    expect(box).toBeTruthy()
    expect(box!.y).toBeLessThan(844)
  })
})
