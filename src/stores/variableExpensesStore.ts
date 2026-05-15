// Full impl (T-044). UUID v4 IDs + boundary validation.

import { defineStore } from 'pinia'
import { reactive } from 'vue'

export interface VariableCategory {
  id: string
  name: string
  budget: number
  spent: number
  categoryId: string
}

export interface VariableExpensesState {
  items: VariableCategory[]
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

export const useVariableExpensesStore = defineStore('variableExpenses', () => {
  const state = reactive<VariableExpensesState>({ items: [] })

  function add(input: Omit<VariableCategory, 'id'>): void {
    if (!isValidName(input.name)) return
    if (!isValidAmount(input.budget)) return
    if (!isValidAmount(input.spent)) return
    state.items.push({ ...input, id: newId() })
  }
  function remove(id: string): void {
    const idx = state.items.findIndex((x) => x.id === id)
    if (idx >= 0) state.items.splice(idx, 1)
  }
  function recordSpending(id: string, amount: number): void {
    if (!isValidAmount(amount)) return
    const item = state.items.find((x) => x.id === id)
    if (!item) return
    item.spent += amount
  }
  function resetAllSpent(): void {
    state.items.forEach((x) => {
      x.spent = 0
    })
  }

  return { state, add, remove, recordSpending, resetAllSpent }
})
