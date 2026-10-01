// Full impl (T-047). FIFO cap of 24 enforced on append (mirrors applySnapshotCap logic).
// Snapshot shape matches SnapshotSchema (lib/storage/schema.ts) — DEBT-001.
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { SnapshotRecord } from '@/lib/calculations/snapshot'

export type Snapshot = SnapshotRecord

export interface SnapshotsState {
  items: Snapshot[]
}

const MAX_SNAPSHOTS = 24

export const useSnapshotsStore = defineStore('snapshots', () => {
  const state = reactive<SnapshotsState>({ items: [] })

  // One snapshot per month: a new snapshot for an existing month replaces it.
  function append(snapshot: Snapshot): void {
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
