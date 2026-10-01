// FIFO cap of 24 enforced on append (mirrors applySnapshotCap logic).
// ADR-4 (20260609-dashboard-fintech-redesign): the Zod schema is the single
// source of truth for the Snapshot shape — a local interface drifted silently
// from the persisted data and was masked by `as any` casts in main.ts.
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { Snapshot } from '@/lib/storage/schema'

export type { Snapshot }

export interface SnapshotsState {
  items: Snapshot[]
}

const MAX_SNAPSHOTS = 24
const YEAR_MONTH = /^\d{4}-\d{2}$/

export const useSnapshotsStore = defineStore('snapshots', () => {
  const state = reactive<SnapshotsState>({ items: [] })

  // Replaces any snapshot of the same month (dedupe) and keeps the 24 most recent.
  function append(snapshot: Snapshot): void {
    if (!YEAR_MONTH.test(snapshot.month)) return
    const updated = [...state.items.filter((s) => s.month !== snapshot.month), snapshot]
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, MAX_SNAPSHOTS)
    state.items.splice(0, state.items.length, ...updated)
  }

  function setAll(items: Snapshot[]): void {
    state.items.splice(0, state.items.length, ...items)
  }

  return { state, append, setAll }
})
