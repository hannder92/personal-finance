// Monthly snapshots (FIFO cap of 24, one per month). Shape mirrors SnapshotSchema
// in lib/storage/schema.ts (DEBT-001).
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { SnapshotRecord } from '@/lib/calculations/snapshot'

export type Snapshot = SnapshotRecord

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
