// Tests for components/common/StorageErrorToast.vue.
// Feature: 20260515-fix-calculos-financieros · Covers AC-1.4 · TC-C-001.
// Today the component is a stub (renders an empty hidden div). Tests RED until T-026 lands.

import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import StorageErrorToast from '@/components/common/StorageErrorToast.vue'
import { useStorageError } from '@/composables/useStorageError'
import { i18n } from '@/i18n'

function mount() {
  return render(StorageErrorToast, {
    global: {
      plugins: [
        i18n,
        createTestingPinia({
          createSpy: vi.fn,
          stubActions: false,
          initialState: {
            settings: {
              state: {
                lang: 'es',
                currency: 'COP',
                theme: 'system',
                payoffMethod: 'avalanche',
                lastMonthSeen: null,
                onboarding: { done: true, currentStep: 0, totalSteps: 3 },
              },
            },
          },
        }),
      ],
    },
  })
}

describe('StorageErrorToast — fix-calculos-financieros (AC-1.4)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Reset the module-level singleton between tests (clearError is no-op in stub today;
    // after T-026 it will null out the error ref).
    useStorageError().clearError()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('TC-C-001: toast is NOT rendered when no storage error has occurred', () => {
    mount()
    const toast = screen.queryByTestId('storage-error-toast')
    // The element exists in the DOM (as stub) but should be hidden when no error.
    expect(toast?.getAttribute('hidden')).not.toBeNull()
  })

  it('TC-C-001: toast renders within one frame when saveAppState fails with quota_exceeded', async () => {
    mount()
    const storageError = useStorageError()
    storageError.setError('quota_exceeded')
    await nextTick()

    const toast = screen.queryByTestId('storage-error-toast')
    expect(toast).toBeTruthy()
    expect(toast?.getAttribute('hidden')).toBeNull()
    // Toast must contain at least the human-readable error label (i18n key result or its Spanish text).
    expect(toast?.textContent ?? '').toMatch(/error|guardar|almacenamiento/i)
  })

  it('TC-C-001: toast does NOT auto-dismiss after 6 seconds (sticky per ADR-4)', async () => {
    mount()
    useStorageError().setError('quota_exceeded')
    await nextTick()

    vi.advanceTimersByTime(6000)
    await nextTick()

    const toast = screen.queryByTestId('storage-error-toast')
    expect(toast).toBeTruthy()
    expect(toast?.getAttribute('hidden')).toBeNull()
  })

  it('TC-C-001: toast exposes a retry button labeled per i18n key storage.error.retry', async () => {
    mount()
    useStorageError().setError('quota_exceeded')
    await nextTick()

    const retryBtn = screen.queryByRole('button', { name: /reintentar|retry/i })
    expect(retryBtn).toBeTruthy()
  })
})
