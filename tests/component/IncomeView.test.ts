import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import IncomeView from '@/views/IncomeView.vue'
import { useIncomeStore } from '@/stores/incomeStore'
import { i18n } from '@/i18n'

function mount(initial: Record<string, unknown> = {}) {
  return render(IncomeView, {
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

// ─────────────────────────────────────────────────────────────────────────────
// sprint1-mejoras-finanzas (AC-5.5) · TC-C-019
// Threshold notice after salary rises above 2 × SMMLV when transport benefit is present.
// ─────────────────────────────────────────────────────────────────────────────

describe('IncomeView threshold notice — sprint1 (AC-5.5)', () => {
  it('TC-C-019 (AC-5.5): notice appears when salary rises above threshold while transport benefit is present', async () => {
    mount({
      income: {
        state: {
          grossSalary: 2_000_000,
          deductions: [],
          otherStreams: [],
          nonSalaryBenefits: [
            { id: 'b1', label: 'Auxilio de transporte', amount: 200_000 },
          ],
        },
      },
    })
    await nextTick()
    // No notice while salary is still ≤ threshold.
    expect(document.querySelector('[data-testid="transport-threshold-notice"]')).toBeNull()

    const income = useIncomeStore()
    income.setGrossSalary(4_000_000)
    await nextTick()

    const notice = document.querySelector('[data-testid="transport-threshold-notice"]') as HTMLElement | null
    expect(notice).toBeTruthy()
    expect(notice?.textContent ?? '').toMatch(/auxilio|transporte|aplica/i)
  })
})
