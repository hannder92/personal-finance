// Full impl (T-044). UUID v4 IDs + boundary validation.

import { defineStore } from 'pinia'
import { reactive } from 'vue'

export interface FixedExpense {
  id: string
  name: string
  amount: number
  category: string
  notes?: string
}

export interface ExpensesState {
  items: FixedExpense[]
}

function newId(): string {
  return globalThis.crypto.randomUUID()
}

function isValidName(name: string): boolean {
  return typeof name === 'string' && name.length > 0 && name.length <= 60
}

function isValidAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount >= 0
}

export const useExpensesStore = defineStore('expenses', () => {
  const state = reactive<ExpensesState>({ items: [] })

  function add(input: Omit<FixedExpense, 'id'>): void {
    if (!isValidName(input.name)) return
    if (!isValidAmount(input.amount)) return
    if (typeof input.category !== 'string' || input.category.length === 0) return
    state.items.push({ ...input, id: newId() })
  }
  function remove(id: string): void {
    const idx = state.items.findIndex((x) => x.id === id)
    if (idx >= 0) state.items.splice(idx, 1)
  }
  function update(id: string, patch: Partial<Omit<FixedExpense, 'id'>>): void {
    const item = state.items.find((x) => x.id === id)
    if (!item) return
    if (patch.name !== undefined && !isValidName(patch.name)) return
    if (patch.amount !== undefined && !isValidAmount(patch.amount)) return
    Object.assign(item, patch)
  }

  return { state, add, remove, update }
})
