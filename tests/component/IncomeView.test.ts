import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import IncomeView from '@/views/IncomeView.vue'

function mount(initial: Record<string, unknown> = {}) {
  return render(IncomeView, {
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
                grossSalary: 3_000_000,
                deductions: [{ id: 'd1', label: 'Salud', amount: 4, type: 'percent' }],
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

describe('IncomeView (AC-2.5 TC-C-009)', () => {
  it('AC-2.5 TC-C-009: changing grossSalary input recomputes deduction equivalent label', async () => {
    mount()

    // Initial: 4% of 3M = 120.000
    expect(screen.getByText(/\$\s*120\.000/)).toBeTruthy()

    const grossInput = screen.getByRole('textbox', {
      name: /salario|gross|bruto/i,
    }) as HTMLInputElement
    await fireEvent.update(grossInput, '6000000')

    // After change: 4% of 6M = 240.000
    expect(screen.getByText(/\$\s*240\.000/)).toBeTruthy()
  })
})
