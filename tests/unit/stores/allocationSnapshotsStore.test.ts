import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAllocationStore } from '@/stores/allocationStore'
import { useSnapshotsStore } from '@/stores/snapshotsStore'

describe('allocationStore (T-047)', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('setAllocation(50, 30) sets savings to 20', () => {
    const s = useAllocationStore()
    const ok = s.setAllocation(50, 30)
    expect(ok).toBe(true)
    expect(s.state.needs).toBe(50)
    expect(s.state.wants).toBe(30)
    expect(s.state.savings).toBe(20)
  })

  it('setAllocation rejects when needs+wants > 100 (returns false, no state change)', () => {
    const s = useAllocationStore()
    s.setAllocation(50, 30) // valid baseline
    const ok = s.setAllocation(60, 50)
    expect(ok).toBe(false)
    expect(s.state.needs).toBe(50)
    expect(s.state.savings).toBe(20)
  })

  it('setAllocation rejects when needs < 0', () => {
    const s = useAllocationStore()
    expect(s.setAllocation(-1, 30)).toBe(false)
  })

  it('setAllocation rejects when wants < 0', () => {
    const s = useAllocationStore()
    expect(s.setAllocation(50, -1)).toBe(false)
  })

  it('setAllocation(100, 0) yields savings=0 (edge case)', () => {
    const s = useAllocationStore()
    expect(s.setAllocation(100, 0)).toBe(true)
    expect(s.state.savings).toBe(0)
  })
})

const makeSnap = (month: string, healthScore = 70) => ({
  id: `${month}-id`,
  capturedAt: `${month}-01T00:00:00.000Z`,
  month,
  netIncome: 4_000_000,
  fixedExpenses: 1_000_000,
  debtPayments: 500_000,
  dti: 12,
  netWorth: 5_000_000,
  healthScore,
})

describe('snapshotsStore (T-047)', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('append adds a snapshot', () => {
    const s = useSnapshotsStore()
    s.append(makeSnap('2026-01'))
    expect(s.state.items.length).toBe(1)
  })

  it('append applies FIFO cap of 24 (oldest dropped first)', () => {
    const s = useSnapshotsStore()
    for (let i = 0; i < 25; i++) {
      s.append(makeSnap(`2024-${String(i + 1).padStart(2, '0')}`))
    }
    expect(s.state.items.length).toBe(24)
    // Oldest (2024-01) should be gone; newest (2024-25) should exist.
    expect(s.state.items.some((x) => x.month === '2024-01')).toBe(false)
    expect(s.state.items.some((x) => x.month === '2024-25')).toBe(true)
  })

  it('setAll replaces items', () => {
    const s = useSnapshotsStore()
    s.append(makeSnap('2026-01'))
    s.setAll([makeSnap('2026-03'), makeSnap('2026-02')])
    expect(s.state.items.length).toBe(2)
    expect(s.state.items[0]!.month).toBe('2026-03')
  })
})
