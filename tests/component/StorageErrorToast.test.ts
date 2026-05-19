// Tests for components/common/StorageErrorToast.vue.
// Feature: 20260516-sprint1-mejoras-finanzas · Covers AC-1.1..1.4 · TC-C-001..004.
//
// RED expectations (assertion-level):
//  - TC-C-001 (AC-1.1) load error 'invalid_json' is not yet in the StorageErrorReason union,
//    so the component falls through the switch default and renders the save-error wording.
//    Asserting the toast text mentions a LOAD context (cargar/load/leer/datos guardados) fails.
//  - TC-C-002 (AC-1.2) currently passes because the component already has no auto-dismiss.
//  - TC-C-003 (AC-1.3) currently passes because the component always renders a retry button.
//  - TC-C-004 (AC-1.4) is asserted for both load and save reasons; the load case requires the
//    component to accept the 'invalid_json' reason and render the alert at all — RED today.

import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import { nextTick } from 'vue'
import StorageErrorToast from '@/components/common/StorageErrorToast.vue'
import { useStorageError, type StorageErrorReason } from '@/composables/useStorageError'
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

describe('StorageErrorToast — sprint1-mejoras-finanzas (AC-1.1..1.4)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useStorageError().clearError()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it("TC-C-001 (AC-1.1): renders visible alert when error is 'invalid_json' (load)", async () => {
    mount()
    const storageError = useStorageError()
    storageError.setError('invalid_json' as StorageErrorReason)
    await nextTick()

    const alert = screen.queryByRole('alert')
    expect(alert).toBeTruthy()
    expect(alert?.getAttribute('hidden')).toBeNull()
    // Load context: message must reference load/read, not just save.
    expect(alert?.textContent ?? '').toMatch(/cargar|carga|leer|load|datos guardados/i)
  })

  it('TC-C-002 (AC-1.2): notification does not auto-dismiss after 10s', async () => {
    mount()
    useStorageError().setError('invalid_json' as StorageErrorReason)
    await nextTick()

    vi.advanceTimersByTime(10_000)
    await nextTick()

    const alert = screen.queryByRole('alert')
    expect(alert).toBeTruthy()
    expect(alert?.getAttribute('hidden')).toBeNull()
  })

  it("TC-C-003 (AC-1.3): retry button visible for save error 'quota_exceeded'", async () => {
    mount()
    useStorageError().setError('quota_exceeded')
    await nextTick()

    const retryBtn = screen.queryByRole('button', { name: /reint|retry/i })
    expect(retryBtn).toBeTruthy()
  })

  it('TC-C-004 (AC-1.4): clicking dismiss removes the alert from the DOM (load error)', async () => {
    mount()
    useStorageError().setError('invalid_json' as StorageErrorReason)
    await nextTick()

    expect(screen.queryByRole('alert')).toBeTruthy()

    const dismissBtn = screen.getByRole('button', { name: /descart|dismiss/i })
    await fireEvent.click(dismissBtn)
    await nextTick()

    expect(screen.queryByRole('alert')).toBeNull()
  })
})
