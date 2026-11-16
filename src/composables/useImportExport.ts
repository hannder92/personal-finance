import { ref } from 'vue'
import { parseBackup, serialize } from '@/lib/storage/backup'
import { LAST_EXPORT_KEY } from '@/lib/storage/keys'
import { useAppState } from './useAppState'

export interface ImportResult {
  ok: boolean
  error?: string
}

function readLastExport(): string | null {
  try {
    return localStorage.getItem(LAST_EXPORT_KEY)
  } catch {
    return null
  }
}

// Shared so every caller sees the same "last backup" date after an export.
const lastExportAt = ref<string | null>(readLastExport())

export function useImportExport() {
  const { buildAppState, applyAppState } = useAppState()

  function exportToFile(): void {
    const now = new Date()
    const body = serialize(buildAppState(), now)

    const blob = new Blob([body], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `personal-finances-${now.toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    lastExportAt.value = now.toISOString()
    try {
      localStorage.setItem(LAST_EXPORT_KEY, lastExportAt.value)
    } catch {
      // Best-effort: the reminder is a convenience, the download already happened.
    }
  }

  // Replaces all current data with the backup's content. The persist watcher in
  // main.ts writes the result to localStorage.
  async function importFromFile(file: File): Promise<ImportResult> {
    const result = parseBackup(await file.text())
    if (!result.ok) return { ok: false, error: result.error }
    applyAppState(result.state)
    return { ok: true }
  }

  return { exportToFile, importFromFile, lastExportAt }
}
