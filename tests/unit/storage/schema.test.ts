import { describe, expect, it } from 'vitest'
import { AppStateSchemaV2 } from '@/lib/storage/schema'
import { BackupEnvelopeSchema } from '@/lib/storage/backup'

function validBaseState() {
  return {
    schemaVersion: 2,
    settings: {
      lang: 'es',
      currency: 'COP',
      theme: 'system',
      payoffMethod: 'avalanche',
      onboarding: { done: false, currentStep: 0 },
      lastMonthSeen: null,
    },
    income: { grossSalary: 0, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
    expenses: [],
    cards: [],
    goals: [],
    assets: [],
    variableExpenses: [],
    allocation: { needs: 50, wants: 30, savings: 20 },
    snapshots: [],
  }
}

describe('lib/storage/schema', () => {
  it('AC-2.5: valid base state passes safeParse and preserves savings=20', () => {
    const result = AppStateSchemaV2.safeParse(validBaseState())
    expect(result.success).toBe(true)
    if (result.success) {
      expect((result.data as { allocation: { savings: number } }).allocation.savings).toBe(20)
    }
  })

  it('TC-U-046 (EC-1): negative grossSalary rejected; error mentions grossSalary', () => {
    const bad = validBaseState()
    bad.income.grossSalary = -500_000
    const result = AppStateSchemaV2.safeParse(bad)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(JSON.stringify(result.error.issues)).toContain('grossSalary')
    }
  })

  it('TC-U-047 (AC-14.2): allocation sum != 100 rejected; error references allocation', () => {
    const bad = validBaseState()
    bad.allocation = { needs: 60, wants: 50, savings: 10 }
    const result = AppStateSchemaV2.safeParse(bad)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(JSON.stringify(result.error.issues).toLowerCase()).toContain('allocation')
    }
  })
})

describe('lib/storage/backup', () => {
  it('TC-U-048 (AC-15.3): envelope missing `data` is rejected; error mentions data', () => {
    const bad = {
      appName: 'personal-finances',
      schemaVersion: 2,
      exportedAt: '2026-05-15T10:30:00.000Z',
      // data missing
    }
    const result = BackupEnvelopeSchema.safeParse(bad)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(JSON.stringify(result.error.issues).toLowerCase()).toContain('data')
    }
  })

  it('TC-U-049 (AC-15.3): unknown schemaVersion is rejected; error references schemaVersion', () => {
    const bad = {
      appName: 'personal-finances',
      schemaVersion: 99,
      exportedAt: '2026-05-15T10:30:00.000Z',
      data: validBaseState(),
    }
    const result = BackupEnvelopeSchema.safeParse(bad)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(JSON.stringify(result.error.issues).toLowerCase()).toContain('schemaversion')
    }
  })

  it('AC-15.3: valid envelope with v2 data passes and preserves appName', () => {
    const good = {
      appName: 'personal-finances',
      schemaVersion: 2,
      exportedAt: '2026-05-15T10:30:00.000Z',
      data: validBaseState(),
    }
    const result = BackupEnvelopeSchema.safeParse(good)
    expect(result.success).toBe(true)
    if (result.success) {
      expect((result.data as { appName: string }).appName).toBe('personal-finances')
    }
  })
})
