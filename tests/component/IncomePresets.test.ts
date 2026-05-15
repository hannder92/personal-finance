import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import PresetButtons from '@/components/income/PresetButtons.vue'
import { useIncomeStore } from '@/stores/incomeStore'

function mount(initial: Record<string, unknown> = {}) {
  return render(PresetButtons, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          stubActions: false, // we want real actions to run so deductions array mutates
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
                grossSalary: 4_000_000,
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

describe('Income presets (AC-2.2 AC-3.3 TC-C-007 TC-C-011)', () => {
  it('AC-2.2 TC-C-007: clicking "Cargar deducciones Colombia" calls applyColombiaPresets', async () => {
    mount()
    const income = useIncomeStore()
    const spy = vi.spyOn(income, 'applyColombiaPresets')

    const btn = screen.getByRole('button', { name: /colombia/i })
    await fireEvent.click(btn)

    expect(spy).toHaveBeenCalled()
  })

  it('AC-2.2 TC-C-007: Colombia preset only visible when currency = COP', () => {
    mount({
      settings: {
        state: {
          lang: 'es',
          currency: 'USD',
          theme: 'system',
          payoffMethod: 'avalanche',
          lastMonthSeen: null,
          onboarding: { done: true, currentStep: 0, totalSteps: 3 },
        },
      },
    })
    expect(screen.queryByRole('button', { name: /colombia/i })).toBeNull()
  })

  it('AC-3.3 TC-C-011: clicking "Cargar prima de servicios" calls addPrimaPreset', async () => {
    mount()
    const income = useIncomeStore()
    const spy = vi.spyOn(income, 'addPrimaPreset')

    const btn = screen.getByRole('button', { name: /prima/i })
    await fireEvent.click(btn)

    expect(spy).toHaveBeenCalled()
  })
})
