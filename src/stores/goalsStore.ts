// Full impl (T-046). UUID v4 + boundary validation + reorder semantics.

import { defineStore } from 'pinia'
import { reactive } from 'vue'

export interface Goal {
  id: string
  name: string
  target: number
  saved: number
  monthlyContrib: number
  targetDate: string | null
  priority: number
}

export interface GoalsState {
  items: Goal[]
}

function newId(): string {
  return globalThis.crypto.randomUUID()
}

function isValidName(name: string): boolean {
  return typeof name === 'string' && name.length > 0 && name.length <= 60
}

function isValidAmount(n: number): boolean {
  return Number.isFinite(n) && n >= 0
}

export const useGoalsStore = defineStore('goals', () => {
  const state = reactive<GoalsState>({ items: [] })

  function add(input: Omit<Goal, 'id' | 'priority'>): void {
    if (!isValidName(input.name)) return
    if (!isValidAmount(input.target)) return
    if (!isValidAmount(input.saved)) return
    if (!isValidAmount(input.monthlyContrib)) return
    state.items.push({ ...input, id: newId(), priority: state.items.length })
  }
  function remove(id: string): void {
    const idx = state.items.findIndex((x) => x.id === id)
    if (idx >= 0) state.items.splice(idx, 1)
  }
  function update(id: string, patch: Partial<Omit<Goal, 'id'>>): void {
    const item = state.items.find((x) => x.id === id)
    if (!item) return
    if (patch.name !== undefined && !isValidName(patch.name)) return
    if (patch.target !== undefined && !isValidAmount(patch.target)) return
    if (patch.saved !== undefined && !isValidAmount(patch.saved)) return
    if (patch.monthlyContrib !== undefined && !isValidAmount(patch.monthlyContrib)) return
    Object.assign(item, patch)
  }
  function reorder(idsInOrder: string[]): void {
    const map = new Map(state.items.map((g) => [g.id, g]))
    const reordered: Goal[] = []
    idsInOrder.forEach((id, idx) => {
      const g = map.get(id)
      if (g) reordered.push({ ...g, priority: idx })
    })
    state.items.splice(0, state.items.length, ...reordered)
  }

  return { state, add, remove, update, reorder }
})
