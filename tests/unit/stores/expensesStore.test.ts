import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useExpensesStore } from '@/stores/expensesStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

describe('expensesStore (T-044)', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('add creates expense with UUID id', () => {
    const s = useExpensesStore()
    s.add({ name: 'Arriendo', amount: 1_500_000, category: 'vivienda' })
    expect(s.state.items.length).toBe(1)
    expect(s.state.items[0]!.id).toMatch(UUID_V4_REGEX)
  })

  it('add rejects empty name', () => {
    const s = useExpensesStore()
    s.add({ name: '', amount: 1_000_000, category: 'vivienda' })
    expect(s.state.items.length).toBe(0)
  })

  it('add rejects negative amount', () => {
    const s = useExpensesStore()
    s.add({ name: 'Test', amount: -1, category: 'vivienda' })
    expect(s.state.items.length).toBe(0)
  })

  it('remove deletes by id', () => {
    const s = useExpensesStore()
    s.add({ name: 'A', amount: 100, category: 'otros' })
    const id = s.state.items[0]!.id
    s.remove(id)
    expect(s.state.items.length).toBe(0)
  })

  it('update patches existing entry', () => {
    const s = useExpensesStore()
    s.add({ name: 'A', amount: 100, category: 'otros' })
    const id = s.state.items[0]!.id
    s.update(id, { amount: 250 })
    expect(s.state.items[0]!.amount).toBe(250)
  })
})

describe('variableExpensesStore (T-044)', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('add creates category with UUID id', () => {
    const s = useVariableExpensesStore()
    s.add({ name: 'Restaurantes', budget: 500_000, spent: 0, categoryId: 'food' })
    expect(s.state.items.length).toBe(1)
    expect(s.state.items[0]!.id).toMatch(UUID_V4_REGEX)
  })

  it('add rejects negative budget', () => {
    const s = useVariableExpensesStore()
    s.add({ name: 'X', budget: -1, spent: 0, categoryId: 'food' })
    expect(s.state.items.length).toBe(0)
  })

  it('recordSpending increments spent', () => {
    const s = useVariableExpensesStore()
    s.add({ name: 'Restaurantes', budget: 500_000, spent: 0, categoryId: 'food' })
    const id = s.state.items[0]!.id
    s.recordSpending(id, 50_000)
    expect(s.state.items[0]!.spent).toBe(50_000)
    s.recordSpending(id, 25_000)
    expect(s.state.items[0]!.spent).toBe(75_000)
  })

  it('recordSpending ignores invalid amount', () => {
    const s = useVariableExpensesStore()
    s.add({ name: 'X', budget: 100, spent: 0, categoryId: 'food' })
    const id = s.state.items[0]!.id
    s.recordSpending(id, -1)
    expect(s.state.items[0]!.spent).toBe(0)
  })

  it('resetAllSpent zeroes every category', () => {
    const s = useVariableExpensesStore()
    s.add({ name: 'A', budget: 100, spent: 50, categoryId: 'food' })
    s.add({ name: 'B', budget: 100, spent: 30, categoryId: 'fun' })
    s.resetAllSpent()
    expect(s.state.items.every((x) => x.spent === 0)).toBe(true)
  })
})
