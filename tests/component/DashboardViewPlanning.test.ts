import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import { i18n } from '@/i18n'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: { template: '<div />' } },
    { path: '/allocation', name: 'allocation', component: { template: '<div />' } },
  ],
})

function mountDashboard(
  income: Record<string, unknown>,
  expenses: Array<{ id: string; name: string; amount: number; category: string }> = []
) {
  return render(DashboardView, {
    global: {
      plugins: [
        i18n,
        router,
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
            income: { state: income },
            expenses: { state: { items: expenses } },
            cards: { state: { items: [] } },
            goals: { state: { items: [] } },
            assets: { state: { items: [] } },
            variableExpenses: { state: { items: [] } },
            allocation: { state: { needs: 50, wants: 30, savings: 20 } },
            snapshots: { state: { items: [] } },
          },
        }),
      ],
      stubs: {
        ProjectionChart: {
          props: ['months'],
          template:
            '<div data-testid="projection-chart" :data-months="JSON.stringify(months)"></div>',
        },
        SavingsProjectionChart: { template: '<div />' },
        DashboardHero: { template: '<div />' },
        KpiStrip: { template: '<div />' },
        HealthScore: { template: '<div />' },
        SavingsGapCard: { template: '<div />' },
        FinancialFreedomCompact: { template: '<div />' },
      },
    },
  })
}

describe('DashboardView planning projection', () => {
  it('TC-C-043 (AC-2.1): first month balance from net cash flow minus fixed expenses', () => {
    mountDashboard(
      {
        grossSalary: 12_100_000,
        deductions: [
          { id: 'd1', label: 'Salud', amount: 4, type: 'percent' },
          { id: 'd2', label: 'Pensión', amount: 4, type: 'percent' },
        ],
        otherStreams: [],
        nonSalaryBenefits: [],
      },
      [{ id: 'e1', name: 'Rent', amount: 1_000_000, category: 'vivienda' }]
    )
    const chart = screen.getByTestId('projection-chart')
    const months = JSON.parse(chart.getAttribute('data-months') ?? '[]') as Array<{
      balance: number
    }>
    expect(months[0]?.balance).toBe(10_132_000)
  })

  it('TC-C-043 (AC-2.2): semiannual stream adds more than linear free cash step', () => {
    mountDashboard({
      grossSalary: 10_000_000,
      deductions: [],
      otherStreams: [{ id: 'bonus', label: 'Prima', amount: 6_000_000, frequency: 'semiannual' }],
      nonSalaryBenefits: [],
    })
    const chart = screen.getByTestId('projection-chart')
    const months = JSON.parse(chart.getAttribute('data-months') ?? '[]') as Array<{
      balance: number
    }>
    const jumpAtPrima = months[6]!.balance - months[5]!.balance
    expect(jumpAtPrima).toBeGreaterThan(10_500_000)
  })
})
