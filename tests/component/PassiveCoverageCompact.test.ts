import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import PassiveCoverageCompact from '@/components/dashboard/PassiveCoverageCompact.vue'
import { i18n } from '@/i18n'

function mountCoverage(piniaState: Record<string, unknown> = {}) {
  return render(PassiveCoverageCompact, {
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
              },
            },
            income: {
              state: {
                grossSalary: 0,
                deductions: [],
                otherStreams: [
                  {
                    id: 'p1',
                    label: 'Renta',
                    amount: 2_000_000,
                    frequency: 'monthly',
                    incomeClass: 'passive',
                  },
                  {
                    id: 'r1',
                    label: 'Consultoría',
                    amount: 1_000_000,
                    frequency: 'monthly',
                    incomeClass: 'residual',
                  },
                ],
                nonSalaryBenefits: [],
              },
            },
            expenses: {
              state: {
                items: [{ id: 'e1', name: 'Vida', amount: 10_000_000, category: 'other' }],
              },
            },
            assets: { state: { items: [] } },
            variableExpenses: { state: { items: [] } },
            allocation: { state: { needs: 50, wants: 30, savings: 20 } },
            ...piniaState,
          },
        }),
      ],
    },
  })
}

describe('PassiveCoverageCompact (20260529-metricas-runway-ingresos)', () => {
  it('TC-C-064 (AC-4.1, AC-4.3): shows 30% coverage and 7M gap with flowCoverage labels', () => {
    mountCoverage()

    expect(screen.getByText(/cobertura por flujo|flow coverage/i)).toBeTruthy()
    expect(screen.getByTestId('flow-coverage-percent').textContent).toMatch(/30/)
    expect(screen.getByTestId('flow-coverage-gap').textContent).toMatch(/7\.?000\.?000|7,000,000/)
    expect(screen.queryByText(/meta de patrimonio|patrimony target/i)).toBeNull()
  })

  it('TC-C-064 (AC-4.2): shows covered indicator when passive+residual ≥ living expense', () => {
    mountCoverage({
      income: {
        state: {
          grossSalary: 0,
          deductions: [],
          otherStreams: [
            {
              id: 'p1',
              label: 'Dividendos',
              amount: 8_000_000,
              frequency: 'monthly',
              incomeClass: 'passive',
            },
            {
              id: 'r1',
              label: 'Regalías',
              amount: 4_000_000,
              frequency: 'monthly',
              incomeClass: 'residual',
            },
          ],
          nonSalaryBenefits: [],
        },
      },
    })

    expect(screen.getByTestId('flow-coverage-covered')).toBeTruthy()
    expect(screen.getByTestId('passive-coverage-compact').getAttribute('data-covered')).toBe('true')
  })
})
