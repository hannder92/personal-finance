import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAssetsStore } from '@/stores/assetsStore'
import { useGoalsStore } from '@/stores/goalsStore'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

describe('goalsStore (T-046)', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('add creates goal with UUID and increasing priority', () => {
    const s = useGoalsStore()
    s.add({ name: 'A', target: 1_000_000, saved: 0, monthlyContrib: 100_000, targetDate: null })
    s.add({ name: 'B', target: 2_000_000, saved: 0, monthlyContrib: 100_000, targetDate: null })
    expect(s.state.items[0]!.id).toMatch(UUID)
    expect(s.state.items[0]!.priority).toBe(0)
    expect(s.state.items[1]!.priority).toBe(1)
  })

  it('add rejects negative target', () => {
    const s = useGoalsStore()
    s.add({ name: 'X', target: -1, saved: 0, monthlyContrib: 0, targetDate: null })
    expect(s.state.items.length).toBe(0)
  })

  it('reorder swaps priorities', () => {
    const s = useGoalsStore()
    s.add({ name: 'A', target: 1_000_000, saved: 0, monthlyContrib: 100_000, targetDate: null })
    s.add({ name: 'B', target: 2_000_000, saved: 0, monthlyContrib: 100_000, targetDate: null })
    const [a, b] = [s.state.items[0]!.id, s.state.items[1]!.id]

    s.reorder([b, a])

    expect(s.state.items[0]!.name).toBe('B')
    expect(s.state.items[0]!.priority).toBe(0)
    expect(s.state.items[1]!.name).toBe('A')
    expect(s.state.items[1]!.priority).toBe(1)
  })

  it('reorder ignores unknown ids gracefully', () => {
    const s = useGoalsStore()
    s.add({ name: 'A', target: 1_000_000, saved: 0, monthlyContrib: 100_000, targetDate: null })
    s.reorder(['not-an-id'])
    expect(s.state.items.length).toBe(0)
  })

  it('update patches existing goal', () => {
    const s = useGoalsStore()
    s.add({ name: 'A', target: 1_000_000, saved: 0, monthlyContrib: 100_000, targetDate: null })
    const id = s.state.items[0]!.id
    s.update(id, { saved: 500_000 })
    expect(s.state.items[0]!.saved).toBe(500_000)
  })
})

describe('assetsStore (T-046)', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('add creates asset with UUID', () => {
    const s = useAssetsStore()
    s.add({ name: 'Savings', value: 10_000_000, type: 'savings' })
    expect(s.state.items.length).toBe(1)
    expect(s.state.items[0]!.id).toMatch(UUID)
  })

  it('add rejects negative value', () => {
    const s = useAssetsStore()
    s.add({ name: 'X', value: -1, type: 'savings' })
    expect(s.state.items.length).toBe(0)
  })

  it('add rejects invalid type', () => {
    const s = useAssetsStore()
    // @ts-expect-error — invalid type at runtime
    s.add({ name: 'X', value: 100, type: 'bogus' })
    expect(s.state.items.length).toBe(0)
  })

  it('remove deletes by id', () => {
    const s = useAssetsStore()
    s.add({ name: 'A', value: 100, type: 'savings' })
    const id = s.state.items[0]!.id
    s.remove(id)
    expect(s.state.items.length).toBe(0)
  })
})

// Tests for feature spec 20260515-fix-calculos-financieros.
// AC-8.2: Asset gains `annualRatePercent: number` (default 0, range [0, 100]).
// These tests RED today: assetsStore.add does NOT accept or persist annualRatePercent.
// After T-015 (schema bump) + T-020 (store update), all pass.
describe('assetsStore — fix-calculos-financieros (annualRatePercent)', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('TC-U-A01 (AC-8.2): add accepts annualRatePercent and persists it', () => {
    const s = useAssetsStore()
    s.add({
      name: 'CDT',
      value: 5_000_000,
      type: 'savings',
      // @ts-expect-error — annualRatePercent added to Asset in T-015
      annualRatePercent: 12,
    })
    expect(s.state.items.length).toBe(1)
    // @ts-expect-error — annualRatePercent added in T-015
    expect(s.state.items[0]!.annualRatePercent).toBe(12)
  })

  it('TC-U-A02 (AC-8.2): add defaults annualRatePercent to 0 when omitted', () => {
    const s = useAssetsStore()
    s.add({ name: 'Cash', value: 1_000_000, type: 'savings' })
    expect(s.state.items.length).toBe(1)
    // @ts-expect-error — annualRatePercent added in T-015
    expect(s.state.items[0]!.annualRatePercent).toBe(0)
  })

  it('TC-U-A03 (AC-8.2): add rejects negative annualRatePercent (silent boundary guard)', () => {
    const s = useAssetsStore()
    s.add({
      name: 'Bad',
      value: 1_000_000,
      type: 'savings',
      // @ts-expect-error — testing runtime guard
      annualRatePercent: -5,
    })
    expect(s.state.items.length).toBe(0)
  })

  it('TC-U-A04 (AC-8.2): add rejects annualRatePercent > 100 (silent boundary guard)', () => {
    const s = useAssetsStore()
    s.add({
      name: 'Outlier',
      value: 1_000_000,
      type: 'savings',
      // @ts-expect-error — testing runtime guard
      annualRatePercent: 9999,
    })
    expect(s.state.items.length).toBe(0)
  })

  it('TC-U-A05 (AC-8.2): update can patch annualRatePercent on existing asset', () => {
    const s = useAssetsStore()
    s.add({ name: 'CDT', value: 5_000_000, type: 'savings' })
    const id = s.state.items[0]!.id
    // @ts-expect-error — update will accept annualRatePercent after T-015
    s.update(id, { annualRatePercent: 8 })
    // @ts-expect-error — annualRatePercent added in T-015
    expect(s.state.items[0]!.annualRatePercent).toBe(8)
  })
})
