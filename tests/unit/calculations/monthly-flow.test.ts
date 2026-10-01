// T-007 — Covers: AC-4.1, EC-3 · TC-U-006, TC-U-007, TC-U-011
import { describe, expect, it } from 'vitest'
import { buildMonthlyFlow } from '@/lib/calculations/monthly-flow'
import type { Snapshot } from '@/lib/storage/schema'

function snap(month: string, overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    id: `id-${month}`,
    month,
    capturedAt: `${month}-28T00:00:00.000Z`,
    netIncome: 4_000_000,
    totalFixedExpenses: 1_000_000,
    totalVariableSpent: 500_000,
    totalDebt: 0,
    dti: 0,
    savingsRate: 0,
    netWorth: 0,
    healthScore: 70,
    debtPayments: 200_000,
    ...overrides,
  } as Snapshot
}

describe('buildMonthlyFlow (TC-U-006, TC-U-007, TC-U-011)', () => {
  it('TC-U-006: caps at 6 most recent closed months in chronological order', () => {
    const snapshots = [
      '2025-10',
      '2025-11',
      '2025-12',
      '2026-01',
      '2026-02',
      '2026-03',
      '2026-04',
      '2026-05',
    ].map((m) => snap(m))
    const flow = buildMonthlyFlow(snapshots)
    expect(flow).toHaveLength(6)
    expect(flow[0]?.month).toBe('2025-12')
    expect(flow[5]?.month).toBe('2026-05')
  })

  it('TC-U-007: expenses = totalFixedExpenses + totalVariableSpent + debtPayments', () => {
    const flow = buildMonthlyFlow([
      snap('2026-05', {
        totalFixedExpenses: 1_000_000,
        totalVariableSpent: 500_000,
        debtPayments: 300_000,
      }),
    ])
    expect(flow[0]?.expenses).toBe(1_800_000)
    expect(flow[0]?.income).toBe(4_000_000)
  })

  it('TC-U-007: pre-V5 snapshots without debtPayments count it as 0', () => {
    const legacy = snap('2026-04')
    delete (legacy as Partial<Snapshot>).debtPayments
    const flow = buildMonthlyFlow([legacy])
    expect(flow[0]?.expenses).toBe(1_500_000)
  })

  it('TC-U-011: partial history (2–5 months) returns only available months, no gaps (EC-3)', () => {
    const flow = buildMonthlyFlow([snap('2026-03'), snap('2026-05')])
    expect(flow).toHaveLength(2)
    expect(flow.map((p) => p.month)).toEqual(['2026-03', '2026-05'])
  })

  it('TC-U-011: unsorted input still yields chronological output', () => {
    const flow = buildMonthlyFlow([snap('2026-05'), snap('2026-01'), snap('2026-03')])
    expect(flow.map((p) => p.month)).toEqual(['2026-01', '2026-03', '2026-05'])
  })
})
