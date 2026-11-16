import { z } from 'zod'
import { migrate } from './migrate'
import { AppStateSchemaV6, type AppStateV6 } from './schema'

export const CURRENT_BACKUP_VERSION = 6

// Backup envelope. `schemaVersion` names the shape of `data`; any version the
// migration chain knows (1..current) is accepted and upgraded on import.
export const BackupEnvelopeSchema = z.object({
  appName: z.literal('personal-finances'),
  schemaVersion: z.number().int().min(1).max(CURRENT_BACKUP_VERSION),
  exportedAt: z.string().datetime(),
  data: z.record(z.unknown()),
})

export type BackupEnvelope = z.infer<typeof BackupEnvelopeSchema>

export type ParsedBackup =
  | { ok: true; state: AppStateV6; exportedAt: string; sourceVersion: number }
  | { ok: false; error: string }

export function serialize(state: AppStateV6, now: Date = new Date()): string {
  const envelope: BackupEnvelope = {
    appName: 'personal-finances',
    schemaVersion: CURRENT_BACKUP_VERSION,
    exportedAt: now.toISOString(),
    data: AppStateSchemaV6.parse(state),
  }
  return JSON.stringify(envelope, null, 2)
}

// Parses a backup file and returns a payload valid against the active schema.
export function parseBackup(json: string): ParsedBackup {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch (_err) {
    return { ok: false, error: 'invalid_json' }
  }

  const envelope = BackupEnvelopeSchema.safeParse(raw)
  if (!envelope.success) {
    return { ok: false, error: envelope.error.issues[0]?.message ?? 'invalid_backup' }
  }
  const { schemaVersion, exportedAt, data } = envelope.data

  // Exports made before this change were labelled v2 but carried the live (V3+)
  // store shape. Running them through the v2→v6 chain would overwrite fields that
  // later versions introduced (incomeClass, userName, projection rate), so try the
  // active schema first and fall back to migration only when that fails.
  if (schemaVersion < CURRENT_BACKUP_VERSION) {
    const direct = AppStateSchemaV6.safeParse({ ...data, schemaVersion: CURRENT_BACKUP_VERSION })
    if (direct.success) {
      return { ok: true, state: direct.data, exportedAt, sourceVersion: schemaVersion }
    }
  }

  const migrated =
    schemaVersion < CURRENT_BACKUP_VERSION ? migrate({ ...data, schemaVersion }) : data
  const result = AppStateSchemaV6.safeParse(migrated)
  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message ?? 'invalid_backup' }
  }
  return { ok: true, state: result.data, exportedAt, sourceVersion: schemaVersion }
}
