// T-005 — Covers: AC-1.3, EC-2 · TC-U-010, TC-I-014 (constitution-driven: migración aditiva)
import { beforeEach, describe, expect, it } from 'vitest'
import { migrate } from '@/lib/storage/migrate'
import { loadAppState, saveAppState } from '@/lib/storage/useAppStorage'
import { AppStateSchemaV4, AppStateSchemaV5 } from '@/lib/storage/schema'
import { STORAGE_KEY } from '@/lib/storage/keys'

// Realistic V4 payload as persisted by a pre-redesign build (snapshot without debtPayments).
function v4Payload() {
  return {
    schemaVersion: 4,
    settings: {
      lang: 'es',
      currency: 'COP',
      theme: 'system',
      payoffMethod: 'avalanche',
      onboarding: { done: true, currentStep: 0 },
      lastMonthSeen: '2026-05',
      projectionAnnualRatePercent: 10,
    },
    income: {
      grossSalary: 5_000_000,
      deductions: [],
      otherStreams: [],
      nonSalaryBenefits: [],
    },
    expenses: [],
    cards: [],
    goals: [],
    assets: [],
    variableExpenses: [],
    allocation: { needs: 50, wants: 30, savings: 20 },
    snapshots: [
      {
        id: '0c8e7c1a-0000-4000-8000-000000000001',
        month: '2026-05',
        capturedAt: '2026-05-31T23:59:00.000Z',
        netIncome: 4_000_000,
        totalFixedExpenses: 1_500_000,
        totalVariableSpent: 800_000,
        totalDebt: 2_000_000,
        dti: 12,
        savingsRate: 0.2,
        netWorth: 10_000_000,
        healthScore: 72,
      },
    ],
  }
}

describe('migrate V4 → V5 (TC-U-010)', () => {
  it('adds settings.userName="" and snapshots[].debtPayments=0', () => {
    const out = migrate(v4Payload()) as {
      schemaVersion: number
      settings: { userName: string; currency: string; lastMonthSeen: string }
      snapshots: Array<{ debtPayments: number; netIncome: number; totalVariableSpent: number }>
    }
    expect(out.schemaVersion).toBe(5)
    expect(out.settings.userName).toBe('')
    expect(out.snapshots[0]?.debtPayments).toBe(0)
  })

  it('does not lose existing V4 fields', () => {
    const out = migrate(v4Payload()) as Record<string, unknown> & {
      settings: Record<string, unknown>
      snapshots: Array<Record<string, unknown>>
    }
    expect(out.settings.currency).toBe('COP')
    expect(out.settings.lastMonthSeen).toBe('2026-05')
    expect(out.settings.projectionAnnualRatePercent).toBe(10)
    expect(out.snapshots[0]?.netIncome).toBe(4_000_000)
    expect(out.snapshots[0]?.totalVariableSpent).toBe(800_000)
    expect(out.snapshots[0]?.healthScore).toBe(72)
  })

  it('is idempotent on V5 input', () => {
    const once = migrate(v4Payload())
    const twice = migrate(once)
    expect(twice).toEqual(once)
  })
})

describe('storage boundary V5 (TC-I-014)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loadAppState migrates a stored V4 payload and parses as V5', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v4Payload()))
    const { state, migrated, parseError } = loadAppState()
    expect(parseError).toBeNull()
    expect(migrated).toBe(true)
    expect(state?.settings.userName).toBe('')
    expect(state?.snapshots[0]?.debtPayments).toBe(0)
  })

  it('saveAppState → loadAppState roundtrip preserves userName and debtPayments', () => {
    const v5 = AppStateSchemaV5.parse({
      ...(migrate(v4Payload()) as object),
    })
    v5.settings.userName = 'Johann'
    v5.snapshots[0]!.debtPayments = 350_000
    const saved = saveAppState(v5)
    expect(saved.ok).toBe(true)
    const { state, parseError } = loadAppState()
    expect(parseError).toBeNull()
    expect(state?.settings.userName).toBe('Johann')
    expect(state?.snapshots[0]?.debtPayments).toBe(350_000)
  })

  it('rejects userName longer than 30 chars at the schema boundary (EC-2)', () => {
    const v5 = AppStateSchemaV5.parse({ ...(migrate(v4Payload()) as object) })
    v5.settings.userName = 'x'.repeat(31)
    const saved = saveAppState(v5)
    expect(saved.ok).toBe(false)
  })

  // Rollback property (2-plan.md §Rollout/Rollback): a V4 build reading a V5
  // payload must fail validation (schemaVersion literal) WITHOUT touching the
  // stored payload — the user recovers via export → rollback → import.
  it('rollback: V4 schema rejects a V5 payload and the stored payload stays intact', () => {
    const v5 = AppStateSchemaV5.parse({ ...(migrate(v4Payload()) as object) })
    expect(saveAppState(v5).ok).toBe(true)
    const storedBefore = localStorage.getItem(STORAGE_KEY)

    // Old build behavior: no migration runs (5 > 4) and V4 safeParse fails.
    const parsedByOldBuild = AppStateSchemaV4.safeParse(JSON.parse(storedBefore!))
    expect(parsedByOldBuild.success).toBe(false)
    expect(localStorage.getItem(STORAGE_KEY)).toBe(storedBefore)
  })
})
