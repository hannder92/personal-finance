// Full impl (T-047). FIFO cap of 24 enforced on append (mirrors applySnapshotCap logic).
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export interface Snapshot {
  id: string
  capturedAt: string
  month: string // YYYY-MM
  netIncome: number
  fixedExpenses: number
  debtPayments: number
  dti: number
  netWorth: number
  healthScore: number
}

export interface SnapshotsState {
  items: Snapshot[]
}

const MAX_SNAPSHOTS = 24

export const useSnapshotsStore = defineStore('snapshots', () => {
  const state = reactive<SnapshotsState>({ items: [] })

  function append(snapshot: Snapshot): void {
    const updated = [...state.items, snapshot]
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, MAX_SNAPSHOTS)
    state.items.splice(0, state.items.length, ...updated)
  }

  function setAll(items: Snapshot[]): void {
    state.items.splice(0, state.items.length, ...items)
  }

  return { state, append, setAll }
})
