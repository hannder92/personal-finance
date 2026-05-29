import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import DebtPayoffSummary from '@/components/debts/DebtPayoffSummary.vue'
import { i18n } from '@/i18n'

describe('DebtPayoffSummary', () => {
  it('TC-C-046 (AC-4.1): shows estimated debt-free date', () => {
    render(DebtPayoffSummary, {
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
              cards: {
                state: {
                  items: [
                    {
                      id: 'c1',
                      name: 'Visa',
                      type: 'card',
                      balance: 1_500_000,
                      apr: 24,
                      minPayment: 200_000,
                      installments: [],
                    },
                    {
                      id: 'c2',
                      name: 'Master',
                      type: 'card',
                      balance: 800_000,
                      apr: 30,
                      minPayment: 120_000,
                      installments: [],
                    },
                  ],
                },
              },
            },
          }),
        ],
      },
    })
    expect(screen.getByTestId('debt-payoff-date')).toBeTruthy()
    expect(screen.getByTestId('debt-payoff-date').textContent).toMatch(/\d{4}/)
  })
})
