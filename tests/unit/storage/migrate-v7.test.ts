// Feature: 20261002-proyecciones-reales · T-005
import { beforeEach, describe, expect, it } from 'vitest'
import { migrate, migrations } from '@/lib/storage/migrate'
import { loadAppState } from '@/lib/storage/useAppStorage'
import { AppStateSchemaV6, AppStateSchemaV7 } from '@/lib/storage/schema'
import { STORAGE_KEY } from '@/lib/storage/keys'

function v6Payload() {
  return {
    schemaVersion: 6,
    settings: {
      lang: 'es',
      currency: 'COP',
      theme: 'system',
      payoffMethod: 'avalanche',
      onboarding: { done: true, currentStep: 0 },
      lastMonthSeen: '2026-09',
      projectionAnnualRatePercent: 6,
      deductRetencion: true,
      userName: '',
    },
    income: { grossSalary: 8_000_000, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
    expenses: [],
    cards: [],
    goals: [
      {
        id: '33333333-3333-4333-8333-333333333333',
        name: 'Viaje',
        target: 10_000_000,
        saved: 1_000_000,
        monthlyContrib: 500_000,
        targetDate: null,
        priority: 0,
      },
    ],
    assets: [],
    variableExpenses: [],
    allocation: { needs: 50, wants: 30, savings: 20 },
    snapshots: [],
  }
}

describe('migrate V6 → V7 (proyecciones reales)', () => {
  it('TC-U-020 (AC-1.1): adds neutral assumptions, keeps the return rate, goals not invested', () => {
    const out = migrations[7]!(v6Payload()) as ReturnType<typeof v6Payload> & {
      settings: Record<string, unknown>
      goals: Array<Record<string, unknown>>
    }
    expect(out.schemaVersion).toBe(7)
    expect(out.settings).toMatchObject({
      inflationPercent: 0,
      withdrawalRatePercent: 4,
      fiDesiredYears: 20,
      projectionAnnualRatePercent: 6,
    })
    expect(out.goals[0]!.invested).toBe(false)
    expect(AppStateSchemaV7.safeParse(out).success).toBe(true)
  })

  it('TC-U-021 (AC-1.6): idempotent and keeps existing values', () => {
    const once = migrate(v6Payload()) as {
      settings: Record<string, unknown>
      goals: Array<Record<string, unknown>>
    }
    once.settings.inflationPercent = 5
    once.goals[0]!.invested = true
    const again = migrate(once) as typeof once
    expect(again.settings.inflationPercent).toBe(5)
    expect(again.goals[0]!.invested).toBe(true)
  })

  it('TC-U-022 (AC-1.3): V7 schema rejects out-of-range assumptions; V6 rejects V7', () => {
    const v7 = migrate(v6Payload()) as { settings: Record<string, unknown> }
    expect(AppStateSchemaV6.safeParse(v7).success).toBe(false)
    for (const [key, bad] of [
      ['inflationPercent', 31],
      ['withdrawalRatePercent', 0.5],
      ['withdrawalRatePercent', 11],
      ['fiDesiredYears', 4],
      ['fiDesiredYears', 20.5],
    ] as const) {
      const copy = structuredClone(v7)
      copy.settings[key] = bad
      expect(AppStateSchemaV7.safeParse(copy).success).toBe(false)
    }
  })
})

describe('storage boundary V7', () => {
  beforeEach(() => localStorage.clear())

  it('loadAppState migrates a stored V6 payload', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v6Payload()))
    const { state, migrated, parseError } = loadAppState()
    expect(parseError).toBeNull()
    expect(migrated).toBe(true)
    expect(state?.schemaVersion).toBe(7)
    expect(state?.settings.withdrawalRatePercent).toBe(4)
    expect(state?.goals[0]?.invested).toBe(false)
  })
})
