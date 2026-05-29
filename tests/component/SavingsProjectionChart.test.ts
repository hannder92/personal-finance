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

  it('TC-C-045 (AC-3.3): shows empty state when no rate configured', () => {
    const { container } = render(SavingsProjectionChart, {
      global: {
        plugins: [i18n, pinia(false)],
        stubs: { Line: { template: '<div />' } },
      },
    })
    expect(container.querySelector('[data-testid="savings-no-rate-empty"]')).toBeTruthy()
  })
})
