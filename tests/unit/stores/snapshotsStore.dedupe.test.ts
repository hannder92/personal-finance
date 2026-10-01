import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildSnapshot } from '@/lib/calculations/snapshot'
import { useSnapshotsStore } from '@/stores/snapshotsStore'

function snap(month: string, netIncome = 1) {
  return buildSnapshot(
    {
      month,
      netIncome,
      totalFixedExpenses: 0,
      totalVariableSpent: 0,
      totalDebt: 0,
      dti: 0,
      savingsRate: 0,
      netWorth: 0,
      healthScore: null,
    },
    new Date(2026, 0, 1)
  )
}

describe('snapshotsStore.append', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('replaces a snapshot of the same month', () => {
    const store = useSnapshotsStore()
    store.append(snap('2026-09', 1))
    store.append(snap('2026-09', 2))
    expect(store.state.items).toHaveLength(1)
    expect(store.state.items[0]!.netIncome).toBe(2)
  })

  it('keeps 24 months sorted newest first', () => {
    const store = useSnapshotsStore()
    for (let i = 1; i <= 30; i++) {
      const y = 2024 + Math.floor((i - 1) / 12)
      const m = String(((i - 1) % 12) + 1).padStart(2, '0')
      store.append(snap(`${y}-${m}`))
    }
    expect(store.state.items).toHaveLength(24)
    expect(store.state.items[0]!.month).toBe('2026-06')
  })

  it('ignores an invalid month', () => {
    const store = useSnapshotsStore()
    store.append(snap('2026-9'))
    expect(store.state.items).toHaveLength(0)
  })
})
