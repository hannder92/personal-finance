import { describe, it, expect, beforeEach } from 'vitest'
import { useStorageError } from '@/composables/useStorageError'

// Reset the module-level singleton state between tests so error state does not
// leak across describe blocks. The composable exports clearError for runtime
// dismissal which is sufficient for test isolation here.
beforeEach(() => {
  useStorageError().clearError()
})

describe('useStorageError — load and save error handling (US-1)', () => {
  it('TC-U-026 (AC-1.1 negative): initial state has no error', () => {
    const { error } = useStorageError()
    expect(error.value).toBeNull()
  })

  it('TC-U-001 (AC-1.1): setError("invalid_json") marks error as a load kind', () => {
    const { setError, error } = useStorageError()
    setError('invalid_json')
    expect(error.value).toBeTruthy()
    expect(error.value?.reason).toBe('invalid_json')
    // New requirement (US-1): the error must declare its kind so the toast can
    // render load-specific vs save-specific messages. Current impl does not.
    expect(error.value?.kind).toBe('load')
  })

  it('TC-U-002 (AC-1.4): clearError() resets the error state', () => {
    const { setError, clearError, error } = useStorageError()
    setError('quota_exceeded')
    expect(error.value).toBeTruthy()
    clearError()
    expect(error.value).toBeNull()
  })

  it('AC-1.3 (save error kind): setError("quota_exceeded") marks error as save kind', () => {
    const { setError, error } = useStorageError()
    setError('quota_exceeded')
    expect(error.value?.reason).toBe('quota_exceeded')
    expect(error.value?.kind).toBe('save')
  })
})
