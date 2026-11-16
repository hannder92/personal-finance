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
  expect(parsed.schemaVersion).toBe(6)
  expect(parsed.data.income.grossSalary).toBe(5_000_000)
  expect(parsed).toHaveProperty('data')
})

// Round trip: a backup restores everything, not only settings + gross salary.
test('import restores the full backup and survives a reload', async ({ returningPage: page }) => {
  const backup = {
    appName: 'personal-finances',
    schemaVersion: 6,
    exportedAt: '2026-11-16T00:00:00.000Z',
    data: {
      schemaVersion: 6,
      settings: {
        lang: 'es',
        currency: 'COP',
        theme: 'system',
        payoffMethod: 'avalanche',
        onboarding: { done: true, currentStep: 0 },
        lastMonthSeen: null,
        projectionAnnualRatePercent: 0,
        deductRetencion: true,
        userName: 'Ana',
      },
      income: { grossSalary: 7_000_000, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
      expenses: [],
      cards: [
        {
          id: '11111111-1111-4111-8111-111111111111',
          type: 'loan',
          name: 'Libranza Banco',
          balance: 30_000_000,
          apr: 18,
          minPayment: 1_000_000,
          remainingInstallments: 40,
          installments: [],
          payrollDeducted: true,
        },
      ],
      goals: [],
      assets: [],
      variableExpenses: [],
      snapshots: [],
      allocation: { needs: 60, wants: 20, savings: 20 },
    },
  }

  await page.goto('/settings')
  await page.getByLabel('Importar').setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  })
  await expect(page.getByRole('status')).toContainText('Importación correcta')

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('finance_app_data')!))
  expect(stored.schemaVersion).toBe(6)
  expect(stored.income.grossSalary).toBe(7_000_000)
  expect(stored.settings.userName).toBe('Ana')
  expect(stored.cards[0]).toMatchObject({ name: 'Libranza Banco', payrollDeducted: true })
  expect(stored.allocation).toEqual({ needs: 60, wants: 20, savings: 20 })

  await page.goto('/debts')
  await expect(page.getByText('Libranza Banco').first()).toBeVisible()
})
