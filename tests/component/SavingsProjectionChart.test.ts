import { render } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import SavingsProjectionChart from '@/components/dashboard/SavingsProjectionChart.vue'
import { i18n } from '@/i18n'

function pinia(withRate: boolean) {
  return createTestingPinia({
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
          projectionAnnualRatePercent: withRate ? 12 : 0,
        },
      },
      income: {
        state: { grossSalary: 10_000_000, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
      },
      expenses: { state: { items: [] } },
      cards: { state: { items: [] } },
      assets: {
        state: {
          items: [
            {
              id: 'a1',
              name: 'CDT',
              value: 5_000_000,
              type: 'savings',
              annualRatePercent: withRate ? 12 : 0,
            },
          ],
        },
      },
      allocation: { state: { needs: 50, wants: 30, savings: 20 } },
      variableExpenses: { state: { items: [] } },
      snapshots: { state: { items: [] } },
    },
  })
}

describe('SavingsProjectionChart planning labels', () => {
  it('TC-C-045 (AC-3.1, AC-3.2): chart datasets use i18n labels for hypothetical and compound', () => {
    const { container } = render(SavingsProjectionChart, {
      global: {
        plugins: [i18n, pinia(true)],
        stubs: { Line: { template: '<div />' } },
      },
    })
    const chart = container.querySelector('[data-testid="savings-projection-chart"]')
    const labels = chart?.getAttribute('data-chart-labels') ?? ''
    expect(labels).toMatch(/Ahorro hipotético|Hypothetical/i)
    expect(labels).toMatch(/crecimiento del patrimonio|Compound|Interés compuesto/i)
  })

  it('TC-C-045 (AC-3.3): shows rate hint when liquid exists but projection rate is zero', () => {
    const { container } = render(SavingsProjectionChart, {
      global: {
        plugins: [i18n, pinia(false)],
        stubs: { Line: { template: '<div />' } },
      },
    })
    expect(container.querySelector('[data-testid="projection-hint-need-rate"]')).toBeTruthy()
  })
})

describe('SavingsProjectionChart (20260529-metricas-runway-ingresos)', () => {
  it('TC-C-067 (AC-6.1): projection rate input is visible', () => {
    const { container } = render(SavingsProjectionChart, {
      global: {
        plugins: [i18n, pinia(true)],
        stubs: { Line: { template: '<div />' } },
      },
    })
    expect(container.querySelector('[data-testid="projection-rate-input"]')).toBeTruthy()
  })

  it('TC-C-067 (AC-6.3, AC-6.4): compound series grows when rate and liquid are configured', () => {
    const { container } = render(SavingsProjectionChart, {
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
                  onboarding: { done: true, currentStep: 0 },
                  projectionAnnualRatePercent: 12,
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
              expenses: { state: { items: [] } },
              cards: { state: { items: [] } },
              assets: {
                state: {
                  items: [
                    {
                      id: 'a1',
                      name: 'Ahorros',
                      value: 10_000_000,
                      type: 'savings',
                      annualRatePercent: 0,
                    },
                  ],
                },
              },
              allocation: { state: { needs: 50, wants: 30, savings: 20 } },
              variableExpenses: { state: { items: [] } },
            },
          }),
        ],
        stubs: { Line: { template: '<div />' } },
      },
    })

    const chart = container.querySelector('[data-testid="savings-projection-chart"]')
    expect(chart?.getAttribute('data-series-count')).toBe('2')
    expect(Number(chart?.getAttribute('data-compound-final'))).toBeGreaterThan(10_000_000)
  })

  it('TC-C-067 (AC-6.5): shows hintNeedRate when liquid exists but rate is zero', () => {
    const { container } = render(SavingsProjectionChart, {
      global: {
        plugins: [i18n, pinia(false)],
        stubs: { Line: { template: '<div />' } },
      },
    })
    expect(container.querySelector('[data-testid="projection-hint-need-rate"]')).toBeTruthy()
  })

  it('TC-C-067 (AC-6.5): shows hintNeedAssets when rate set but no liquid', () => {
    const { container } = render(SavingsProjectionChart, {
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
                  onboarding: { done: true, currentStep: 0 },
                  projectionAnnualRatePercent: 10,
                },
              },
              income: {
                state: { grossSalary: 0, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
              },
              expenses: { state: { items: [] } },
              cards: { state: { items: [] } },
              assets: { state: { items: [] } },
              allocation: { state: { needs: 50, wants: 30, savings: 20 } },
              variableExpenses: { state: { items: [] } },
            },
          }),
        ],
        stubs: { Line: { template: '<div />' } },
      },
    })
    expect(container.querySelector('[data-testid="projection-hint-need-assets"]')).toBeTruthy()
  })
})
