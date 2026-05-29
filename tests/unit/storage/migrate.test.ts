import { describe, expect, it } from 'vitest'
import { migrate } from '@/lib/storage/migrate'
import { AppStateSchemaV3 } from '@/lib/storage/schema'
import { applySnapshotCap, buildSnapshot } from '@/lib/calculations/snapshot'
import v1Typical from '../../fixtures/v1-typical.json'
import v1Empty from '../../fixtures/v1-empty.json'

describe('lib/storage/migrate', () => {
  it('TC-U-042 (EC-5): migrating typical v1 state produces a valid latest-schema state (v3)', () => {
    const result = migrate(v1Typical)
    const parse = AppStateSchemaV3.safeParse(result)
    expect(parse.success).toBe(true)
  })

  it('TC-U-043 (EC-5): migration preserves UUID IDs from v1 entities', () => {
    const result = migrate(v1Typical) as {
      expenses: { id: string }[]
      cards: { id: string }[]
      goals: { id: string }[]
    }
    expect(
      result.expenses.find((e) => e.id === '44444444-4444-4444-8444-444444444444')
    ).toBeTruthy()
    expect(result.cards.find((c) => c.id === '55555555-5555-4555-8555-555555555555')).toBeTruthy()
    expect(result.goals.find((g) => g.id === '66666666-6666-4666-8666-666666666666')).toBeTruthy()
  })

  it('TC-U-044: migrated v1 always sets onboarding.done=true (legacy field)', () => {
    const typical = migrate(v1Typical) as { settings: { onboarding: { done: boolean } } }
    const empty = migrate(v1Empty) as { settings: { onboarding: { done: boolean } } }
    expect(typical.settings.onboarding.done).toBe(true)
    expect(empty.settings.onboarding.done).toBe(true)
  })

  it('TC-U-045 (AC-3.1): existing otherStreams default to frequency="monthly"', () => {
    const result = migrate(v1Typical) as { income: { otherStreams: Array<{ frequency: string }> } }
    expect(result.income.otherStreams[0]?.frequency).toBe('monthly')
  })

  it('EC-5: schemaVersion is set to the latest (3) on migrated output', () => {
    const result = migrate(v1Typical) as { schemaVersion: number }
    expect(result.schemaVersion).toBe(3)
  })
})

describe('lib/calculations/snapshot', () => {
  it('TC-U-055 (AC-13.2): buildSnapshot returns the 10-field documented shape', () => {
    const now = new Date('2026-05-15T10:30:00.000Z')
    const record = buildSnapshot(
      {
        month: '2026-05',
        netIncome: 4_000_000,
        totalFixedExpenses: 1_500_000,
        totalVariableSpent: 300_000,
        totalDebt: 2_000_000,
        dti: 25,
        savingsRate: 15,
        netWorth: 8_000_000,
        healthScore: 75,
      },
      now
    )
    expect(record.id).toBeTruthy()
    expect(record.capturedAt).toBe('2026-05-15T10:30:00.000Z')
    expect(record.month).toBe('2026-05')
    expect(record.netIncome).toBe(4_000_000)
    expect(record.totalFixedExpenses).toBe(1_500_000)
    expect(record.totalVariableSpent).toBe(300_000)
    expect(record.totalDebt).toBe(2_000_000)
    expect(record.dti).toBe(25)
    expect(record.savingsRate).toBe(15)
    expect(record.netWorth).toBe(8_000_000)
    expect(record.healthScore).toBe(75)
  })

  it('TC-U-056 (EC-6 adjacent): applySnapshotCap drops oldest entries beyond 24', () => {
    const now = new Date('2026-05-15T10:30:00.000Z')
    const records = Array.from({ length: 25 }, (_, i) =>
      buildSnapshot(
        {
          month: `2024-${String((i % 12) + 1).padStart(2, '0')}`,
          netIncome: 0,
          totalFixedExpenses: 0,
          totalVariableSpent: 0,
          totalDebt: 0,
          dti: 0,
          savingsRate: 0,
          netWorth: 0,
          healthScore: null,
        },
        new Date(now.getTime() + i * 1000)
      )
    )
    const result = applySnapshotCap(records)
    expect(result).toHaveLength(24)
  })
})
