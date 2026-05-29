import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import DebtPayoffSimulator from '@/components/debts/DebtPayoffSimulator.vue'
import { i18n } from '@/i18n'

describe('DebtPayoffSimulator', () => {
  it('TC-C-047 (AC-4.2): extra payment shows months and interest saved', async () => {
    render(DebtPayoffSimulator, {
      props: { debtId: 'c1' },
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
                      balance: 2_000_000,
                      limit: 5_000_000,
                      apr: 24,
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
    const input = screen.getByLabelText(/pago extra|extra payment/i)
    await fireEvent.input(input, { target: { value: '200000' } })
    await fireEvent.click(screen.getByRole('button', { name: /simular|simulate/i }))
    const months = screen.getByTestId('payoff-months-saved')
    const interest = screen.getByTestId('payoff-interest-saved')
    expect(months.textContent).toMatch(/[1-9]\d*/)
    expect(interest.textContent).toMatch(/\d/)
  })
})
