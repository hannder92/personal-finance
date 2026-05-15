import { migrate } from './migrate'
import { AppStateSchemaV2, type AppStateV2 } from './schema'
import { BACKUP_KEY, STORAGE_KEY } from './keys'

export interface LoadResult {
  state: AppStateV2 | null
  /** True when a v1 payload was migrated to v2 on this read. */
  migrated: boolean
  /** Present when the stored payload exists but fails v2 schema validation. */
  parseError: string | null
}

// Reads the persisted state, runs migration if needed, and validates against the v2 schema.
// On parse failure the original payload is left untouched so a recovery UI can act.
export function loadAppState(storage: Storage = localStorage): LoadResult {
  const raw = storage.getItem(STORAGE_KEY)
  if (raw === null) return { state: null, migrated: false, parseError: null }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (_err) {
    return { state: null, migrated: false, parseError: 'invalid_json' }
  }

  const currentVersion = (parsed as { schemaVersion?: number }).schemaVersion ?? 1
  const migrated = currentVersion < 2
  if (migrated) {
    backupV1Once(raw, storage)
    parsed = migrate(parsed)
  }

  const result = AppStateSchemaV2.safeParse(parsed)
  if (!result.success) {
    return { state: null, migrated, parseError: result.error.message }
  }
  return { state: result.data, migrated, parseError: null }
}

// Writes only when the payload validates. Quota errors are surfaced as a return value
// so callers can show a non-blocking toast without losing in-memory state.
export function saveAppState(
  state: AppStateV2,
  storage: Storage = localStorage
): { ok: true } | { ok: false; reason: 'quota_exceeded' | 'invalid_state' } {
  const parsed = AppStateSchemaV2.safeParse(state)
  if (!parsed.success) return { ok: false, reason: 'invalid_state' }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(parsed.data))
    return { ok: true }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      return { ok: false, reason: 'quota_exceeded' }
    }
    throw err
  }
}

function backupV1Once(rawV1Payload: string, storage: Storage): void {
  if (storage.getItem(BACKUP_KEY) !== null) return
  try {
    storage.setItem(BACKUP_KEY, rawV1Payload)
  } catch {
    // Backup is best-effort; do not block migration if quota fails here.
  }
}
