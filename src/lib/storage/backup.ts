import { z } from 'zod'
import { AppStateSchemaV2 } from './schema'

// Backup envelope discriminated by schemaVersion. Only v2 is currently accepted on the
// import path; older payloads must be routed through `migrate()` first.
export const BackupEnvelopeSchema = z.object({
  appName: z.literal('personal-finances'),
  schemaVersion: z.literal(2),
  exportedAt: z.string().datetime(),
  data: AppStateSchemaV2,
})

export type BackupEnvelope = z.infer<typeof BackupEnvelopeSchema>

export function serialize(state: z.infer<typeof AppStateSchemaV2>): string {
  const envelope: BackupEnvelope = {
    appName: 'personal-finances',
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    data: state,
  }
  return JSON.stringify(envelope, null, 2)
}

export function parseBackup(json: string): z.SafeParseReturnType<unknown, BackupEnvelope> {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (_err) {
    return {
      success: false,
      error: new z.ZodError([
        {
          code: z.ZodIssueCode.custom,
          path: [],
          message: 'invalid_json',
        },
      ]),
    }
  }
  return BackupEnvelopeSchema.safeParse(parsed)
}
