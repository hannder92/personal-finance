// Module-level singleton ref for storage write failures.
// Consumed by StorageErrorToast.vue and pushed to by main.ts's persistStores watcher.

import { ref, type Ref } from 'vue'
import { saveAppState } from '@/lib/storage/useAppStorage'
import type { AppStateV3 } from '@/lib/storage/schema'

export type StorageErrorReason = 'quota_exceeded' | 'invalid_state' | 'unknown'

export interface StorageError {
  visible: boolean
  reason: StorageErrorReason
}

const sharedError: Ref<StorageError | null> = ref(null)
// Callback queue so the toast's retry button can ask main.ts to attempt another save.
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
    sharedError.value = { visible: true, reason }
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
