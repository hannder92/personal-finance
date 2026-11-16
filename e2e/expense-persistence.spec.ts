import { expect, test } from './fixtures'

// Regression: a category outside the persisted schema made every save fail silently.
test('fixed expenses of every category survive a reload', async ({ page }) => {
  // freshPage clears storage on every load, including the reload under test.
  await page.goto('/expenses')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  for (const [name, category] of [
    ['Bus', 'transport'],
    ['Mercado', 'food'],
  ] as const) {
    await page.getByRole('textbox', { name: 'Nombre' }).fill(name)
    await page.getByRole('textbox', { name: 'Monto' }).fill('150000')
    await page.getByRole('combobox', { name: 'Categoría' }).selectOption(category)
    await page.getByRole('button', { name: 'Agregar' }).click()
  }
  await expect(page.getByTestId('storage-error-toast')).toBeHidden()

  await page.reload()
  await expect(page.getByText('Bus')).toBeVisible()
  await expect(page.getByText('Mercado')).toBeVisible()
  await expect(page.getByRole('list').getByText('Transporte')).toBeVisible()
})

test('unknown routes show the not-found page', async ({ freshPage: page }) => {
  await page.goto('/no-existe')
  await expect(page.getByTestId('not-found')).toBeVisible()
})
