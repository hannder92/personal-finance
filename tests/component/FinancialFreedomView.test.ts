import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import FinancialFreedomView from '@/views/FinancialFreedomView.vue'
import { i18n } from '@/i18n'

describe('FinancialFreedomView', () => {
  it('TC-C-050 (AC-5.1–AC-5.4): shows living expense, liquid assets, target and horizon', () => {
    render(FinancialFreedomView, {
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
                  items: [{ id: 'e1', name: 'Rent', amount: 4_000_000, category: 'vivienda' }],
                },
              },
              cards: { state: { items: [] } },
              assets: {
                state: {
                  items: [
                    {
                      id: 'a1',
                      name: 'Cash',
                      value: 50_000_000,
                      type: 'cash',
                      annualRatePercent: 0,
                    },
                    {
                      id: 'a2',
                      name: 'Home',
                      value: 200_000_000,
                      type: 'property',
                      annualRatePercent: 0,
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
    expect(screen.getByTestId('fi-living-expense')).toBeTruthy()
    expect(screen.getByTestId('fi-liquid-assets')).toBeTruthy()
    expect(screen.getByTestId('fi-target')).toBeTruthy()
    expect(screen.getByTestId('fi-horizon')).toBeTruthy()
    expect(screen.getByTestId('fi-liquid-assets').textContent).not.toMatch(
      /200\.000\.000|200,000,000/
    )
  })
})

// Feature: 20260529-metricas-runway-ingresos · extended in T-018
describe.skip('FinancialFreedomView (20260529-metricas-runway-ingresos flow coverage)', () => {})
