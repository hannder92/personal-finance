// Module-level singleton ref for storage failures.
// Consumed by StorageErrorToast.vue; pushed to by main.ts's hydrateStores (load errors)
// and persistStores watcher (save errors).

import { ref, type Ref } from 'vue'
import { saveAppState } from '@/lib/storage/useAppStorage'
import type { AppStateV3 } from '@/lib/storage/schema'

export type StorageErrorReason =
  | 'invalid_json'
  | 'quota_exceeded'
  | 'invalid_state'
  | 'unknown'
  // Zod validation messages from loadAppState arrive as arbitrary strings.
  | (string & {})

export type StorageErrorKind = 'load' | 'save'

export interface StorageError {
  visible: boolean
  reason: StorageErrorReason
  kind: StorageErrorKind
}

const SAVE_REASONS = new Set<string>(['quota_exceeded', 'invalid_state', 'unknown'])

function classifyKind(reason: StorageErrorReason): StorageErrorKind {
  return SAVE_REASONS.has(reason) ? 'save' : 'load'
}

const sharedError: Ref<StorageError | null> = ref(null)
const retryQueue: Array<() => AppStateV3> = []

export interface UseStorageError {
  error: Ref<StorageError | null>
  setError: (reason: StorageErrorReason) => void
  clearError: () => void
  retry: () => Promise<void>
  registerRetrySource: (provider: () => AppStateV3) => void
}

export function useStorageError(): UseStorageError {
  function setError(reason: StorageErrorReason): void {
    sharedError.value = { visible: true, reason, kind: classifyKind(reason) }
  }
  function clearError(): void {
    sharedError.value = null
  }
  async function retry(): Promise<void> {
    if (retryQueue.length === 0) {
      clearError()
      return
    }
    const provider = retryQueue[retryQueue.length - 1]!
    const result = saveAppState(provider())
    if (result.ok) clearError()
    else setError(result.reason)
  }
  function registerRetrySource(provider: () => AppStateV3): void {
    retryQueue.length = 0
    retryQueue.push(provider)
  }
  return { error: sharedError, setError, clearError, retry, registerRetrySource }
}
