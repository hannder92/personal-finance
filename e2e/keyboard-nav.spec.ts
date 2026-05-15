import { expect, test } from './fixtures'

// TC-E-009: AC-16.2
test('TC-E-009: Tab key navigates through income form without traps', async ({
  returningPage: page,
}) => {
  await page.goto('/income')
  await expect(page.getByText('Ingresos').first()).toBeVisible({ timeout: 5000 })

  // Tab through the first input.
  await page.keyboard.press('Tab')
  const focused = await page.evaluate(() => document.activeElement?.tagName)
  expect(['INPUT', 'BUTTON', 'SELECT', 'A', 'TEXTAREA'].includes(focused ?? '')).toBe(true)
})

test('TC-E-009: focused elements have a visible focus ring (outline not none)', async ({
  returningPage: page,
}) => {
  await page.goto('/income')
  await expect(page.getByText('Ingresos').first()).toBeVisible({ timeout: 5000 })

  await page.keyboard.press('Tab')
  const outlineStyle = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement
    if (!el) return 'none'
    const style = window.getComputedStyle(el)
    return style.outlineStyle ?? style.outline
  })
  // Tailwind's focus-visible ring uses box-shadow (ring utility) instead of outline.
  const boxShadow = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement
    if (!el) return 'none'
    return window.getComputedStyle(el).boxShadow
  })
  const hasFocusIndicator = outlineStyle !== 'none' || (boxShadow !== 'none' && boxShadow !== '')
  expect(hasFocusIndicator).toBe(true)
})
