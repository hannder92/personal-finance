import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SettingsPanel from '@/components/settings/SettingsPanel.vue'

function mount(initial: Record<string, unknown> = {}) {
  return render(SettingsPanel, {
    global: {
      plugins: [
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
            income: {
              state: {
                grossSalary: 5_000_000,
                deductions: [],
                otherStreams: [],
                nonSalaryBenefits: [],
              },
            },
            ...initial,
          },
        }),
      ],
    },
  })
}

describe('SettingsPanel — Export (AC-15.1 TC-C-030)', () => {
  beforeEach(() => {
    const original = URL.createObjectURL
    ;(URL as unknown as { createObjectURL: () => string }).createObjectURL = vi.fn(
      () => 'blob:mock'
    )
    if (!URL.revokeObjectURL)
      (URL as unknown as { revokeObjectURL: () => void }).revokeObjectURL = vi.fn()
    void original
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('AC-15.1 TC-C-030: clicking "Exportar" emits export event', async () => {
    const { emitted } = mount()
    await fireEvent.click(screen.getByRole('button', { name: /exportar|export/i }))
    expect(emitted()).toHaveProperty('export')
  })
})

describe('SettingsPanel — Import (AC-15.2 AC-15.3 TC-C-030)', () => {
  it('AC-15.2 TC-C-030: file input emits import event with selected file', async () => {
    const { emitted } = mount()

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeTruthy()

    const file = new File(['{}'], 'backup.json', { type: 'application/json' })
    Object.defineProperty(fileInput, 'files', { value: [file] })
    await fireEvent.change(fileInput)

    const importEvents = emitted('import') as unknown[][] | undefined
    expect(importEvents).toBeTruthy()
    expect((importEvents?.[0]?.[0] as File | undefined)?.name).toBe('backup.json')
  })
})

describe('SettingsPanel — Reset (AC-15.4 TC-C-031)', () => {
  it('AC-15.4 TC-C-031: clicking "Reiniciar" opens confirm dialog', async () => {
    mount()
    await fireEvent.click(screen.getByRole('button', { name: /reiniciar|reset/i }))
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('AC-15.4 TC-C-031: confirming reset emits reset event', async () => {
    const { emitted } = mount()
    await fireEvent.click(screen.getByRole('button', { name: /reiniciar|reset/i }))
    const confirm = screen.getByRole('button', { name: /confirmar|sí|si|confirm/i })
    await fireEvent.click(confirm)
    expect(emitted()).toHaveProperty('reset')
  })

  it('AC-15.4 TC-C-031: cancelling reset does NOT emit reset event', async () => {
    const { emitted } = mount()
    await fireEvent.click(screen.getByRole('button', { name: /reiniciar|reset/i }))
    const cancel = screen.getByRole('button', { name: /cancelar|no|cancel/i })
    await fireEvent.click(cancel)
    expect(emitted('reset')).toBeUndefined()
  })
})
