import { expect, test } from './fixtures'

// TC-E-001: AC-1.1, AC-1.5, AC-10.1
test('TC-E-001: fresh session shows onboarding wizard (step 1)', async ({ freshPage: page }) => {
  await page.goto('/')
  // Onboarding wizard should appear for new users.
  await expect(page.getByText(/tu ingreso|salario bruto/i).first()).toBeVisible({ timeout: 8000 })
})

test('TC-E-001: completing onboarding shows dashboard with KPI cards', async ({
  freshPage: page,
}) => {
  await page.goto('/')
  // Fill gross salary in step 1.
  const salaryInput = page.getByRole('textbox', { name: /salario bruto/i }).first()
  await salaryInput.fill('5000000')
  // Click "Siguiente" to advance steps.
  await page.getByRole('button', { name: /siguiente/i }).click()
  await page.getByRole('button', { name: /siguiente/i }).click()
  // On last step, click "Finalizar".
  await page.getByRole('button', { name: /finalizar/i }).click()
  // Dashboard should now show key metrics.
  await expect(page.getByText('Dashboard').first()).toBeVisible({ timeout: 8000 })
})
