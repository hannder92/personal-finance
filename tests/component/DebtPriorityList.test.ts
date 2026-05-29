import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import DebtPriorityList from '@/components/debts/DebtPriorityList.vue'
import { i18n } from '@/i18n'

describe('DebtPriorityList', () => {
  it('TC-C-049 (AC-4.4): lists debts in avalanche order by default', () => {
    render(DebtPriorityList, {
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
                      id: 'low-apr',
                      name: 'Loan',
                      type: 'card',
                      balance: 2_000_000,
                      apr: 15,
                      minPayment: 150_000,
                      installments: [],
                    },
                    {
                      id: 'high-apr',
                      name: 'Card',
                      type: 'card',
                      balance: 1_000_000,
                      apr: 30,
                      minPayment: 100_000,
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
    const items = screen.getAllByTestId('debt-priority-item')
    expect(items[0]?.getAttribute('data-debt-id')).toBe('high-apr')
    expect(items[1]?.getAttribute('data-debt-id')).toBe('low-apr')
  })
})
