import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import SavingsGapCard from '@/components/dashboard/SavingsGapCard.vue'
import { i18n } from '@/i18n'

function mountCard() {
  return render(SavingsGapCard, {
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
                grossSalary: 10_000_000,
                deductions: [],
                otherStreams: [],
                nonSalaryBenefits: [],
              },
            },
            expenses: {
              state: {
                items: [{ id: 'e1', name: 'Rent', amount: 8_000_000, category: 'vivienda' }],
              },
            },
            cards: {
              state: {
                items: [
                  {
                    id: 'c1',
                    name: 'Card',
                    type: 'card',
                    balance: 1_000_000,
                    limit: 2_000_000,
                    apr: 24,
                    minPayment: 1_200_000,
                    installments: [],
                  },
                ],
              },
            },
            allocation: { state: { needs: 50, wants: 30, savings: 20 } },
          },
        }),
      ],
    },
  })
}

describe('SavingsGapCard', () => {
  it('TC-C-040 (AC-1.1–AC-1.3): shows objective, feasible, gap and alert when not viable', () => {
    mountCard()
    expect(screen.getByTestId('savings-gap-objective')).toBeTruthy()
    expect(screen.getByTestId('savings-gap-feasible')).toBeTruthy()
    expect(screen.getByTestId('savings-gap-gap')).toBeTruthy()
    expect(screen.getByRole('alert')).toBeTruthy()
  })
})
