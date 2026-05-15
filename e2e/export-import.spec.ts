import { readFileSync } from 'fs'
import { expect, test } from './fixtures'

// TC-E-004: AC-15.1, AC-15.2
test('TC-E-004: export triggers JSON download with valid content', async ({
  returningPage: page,
}) => {
  await page.goto('/settings')
  await expect(page.getByText('Configuración').first()).toBeVisible({ timeout: 5000 })

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /exportar/i }).click(),
  ])

  const path = await download.path()
  const json = readFileSync(path!, 'utf8')
  const parsed = JSON.parse(json)
  expect(parsed.appName).toBe('personal-finances')
  expect(parsed.schemaVersion).toBe(2)
  expect(parsed).toHaveProperty('data')
})
