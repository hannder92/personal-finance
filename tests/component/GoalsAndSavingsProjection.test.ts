// Tests for GoalsView reactive cap + SavingsProjectionChart datasets/empty state.
// Feature: 20260515-fix-calculos-financieros
// Planificación integrada — SavingsProjectionChart i18n labels: T-021 TC-C-045 (AC-3.1–AC-3.3)
// Covers AC-6.2, AC-8.1, AC-8.3, AC-8.4, AC-8.5, EC-10
// TCs: TC-C-007, TC-C-008, TC-C-009, TC-C-010, TC-C-011

import { render } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import GoalsView from '@/views/GoalsView.vue'
import SavingsProjectionChart from '@/components/dashboard/SavingsProjectionChart.vue'
import { useAllocationStore } from '@/stores/allocationStore'
import { i18n } from '@/i18n'

function defaultSettingsState() {
  return {
    lang: 'es',
    currency: 'COP',
    theme: 'system',
    payoffMethod: 'avalanche',
    lastMonthSeen: null,
  }
}

function pinia(options: {
  grossSalary?: number
  deductions?: Array<{ id: string; label: string; amount: number; type: 'fixed' | 'percent' }>
  savings?: number
  goals?: Array<{
    id: string
    name: string
    target: number
    saved: number
    monthlyContrib: number
    targetDate: string | null
    priority: number
  }>
  assets?: Array<{
    id: string
    name: string
    value: number
    type: string
    annualRatePercent?: number
  }>
}) {
  return createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: {
      settings: { state: defaultSettingsState() },
      income: {
        state: {
          grossSalary: options.grossSalary ?? 0,
          deductions: options.deductions ?? [],
          otherStreams: [],
          nonSalaryBenefits: [],
        },
      },
      expenses: { state: { items: [] } },
      cards: { state: { items: [] } },
      goals: { state: { items: options.goals ?? [] } },
      assets: { state: { items: options.assets ?? [] } },
      variableExpenses: { state: { items: [] } },
      allocation: {
        state: { needs: 50, wants: 30, savings: options.savings ?? 20 },
      },
      snapshots: { state: { items: [] } },
    },
  })
}

describe('GoalsView — fix-calculos-financieros (AC-6.2 reactive cap)', () => {
  it('TC-C-007 (AC-6.2): cap reflects allocation.savings × netIncome, updates on allocation change', async () => {
    const allocation = useAllocationStore
    // Seed: gross 10M, no deductions → net 10M; savings 20% → cap = 2M.
    const { container } = render(GoalsView, {
      global: {
        plugins: [i18n, pinia({ grossSalary: 10_000_000, savings: 20 })],
        stubs: {
          GoalList: {
            props: ['savingsBucket', 'currency'],
            template: '<div data-testid="goal-list" :data-cap="savingsBucket"></div>',
          },
        },
      },
    })

    const list = container.querySelector('[data-testid="goal-list"]')
    expect(list).toBeTruthy()
    // Today GoalsView passes grossSalary × 0.15 = 1.500.000 → assertion fails.
    expect(Number(list?.getAttribute('data-cap'))).toBe(2_000_000)

    // Change allocation to savings = 30%; the cap should auto-update to 3M.
    const store = allocation()
    store.setAllocation(50, 20)
    await nextTick()
    expect(Number(list?.getAttribute('data-cap'))).toBe(3_000_000)
  })
})

function chartStubs() {
  return {
    Line: {
      props: ['data', 'options'],
      template: '<div data-testid="line-chart-stub"></div>',
    },
  }
}

describe('SavingsProjectionChart — fix-calculos-financieros (AC-8.1/8.3/8.4/8.5)', () => {
  it('TC-C-008 (AC-8.1, AC-8.3): renders 2 datasets when both hypothetical and compound data exist', () => {
    const { container } = render(SavingsProjectionChart, {
      global: {
        plugins: [
          i18n,
          pinia({
            grossSalary: 10_000_000,
            savings: 20,
            assets: [
              {
                id: 'a1',
                name: 'CDT',
                value: 5_000_000,
                type: 'savings',
                annualRatePercent: 10,
              },
            ],
          }),
        ],
        stubs: chartStubs(),
      },
    })

    const chart = container.querySelector('[data-testid="savings-projection-chart"]')
    expect(chart).toBeTruthy()
    // The chart should advertise 2 series in its rendered output.
    expect(chart?.getAttribute('data-series-count')).toBe('2')
  })

  it('TC-C-009 (AC-8.4): hypothetical series updates when allocation.savings changes', async () => {
    const { container } = render(SavingsProjectionChart, {
      global: {
        plugins: [
          i18n,
          pinia({
            grossSalary: 10_000_000,
            savings: 20,
            assets: [
              { id: 'a1', name: 'CDT', value: 5_000_000, type: 'savings', annualRatePercent: 10 },
            ],
          }),
        ],
        stubs: chartStubs(),
      },
    })

    const chart = container.querySelector('[data-testid="savings-projection-chart"]')
    const before = chart?.getAttribute('data-hypothetical-final')
    useAllocationStore().setAllocation(40, 30) // savings becomes 30
    await nextTick()
    const after = chart?.getAttribute('data-hypothetical-final')
    expect(after).not.toBe(before)
    expect(after).not.toBeNull()
  })

  it('TC-C-010 (AC-8.5): no asset rate configured → empty-state message inside the chart', () => {
    const { container } = render(SavingsProjectionChart, {
      global: {
        plugins: [
          i18n,
          pinia({
            grossSalary: 10_000_000,
            savings: 20,
            assets: [
              { id: 'a1', name: 'CDT', value: 5_000_000, type: 'savings', annualRatePercent: 0 },
            ],
          }),
        ],
        stubs: chartStubs(),
      },
    })

    const chart = container.querySelector('[data-testid="savings-projection-chart"]')
    expect(chart).toBeTruthy()
    // Empty-state lives INSIDE the chart, not in DashboardView (per vue-component-engineer review).
    const emptyState = chart?.querySelector('[data-testid="savings-no-rate-empty"]')
    expect(emptyState).toBeTruthy()
    // Should reference the i18n key 'savings.noRateConfigured' or its rendered Spanish text.
    expect(emptyState?.textContent ?? '').toMatch(/tasa|rate/i)
  })

  it('TC-C-011 (EC-10): hypothetical series visible even when compound has no qualifying data', () => {
    const { container } = render(SavingsProjectionChart, {
      global: {
        plugins: [
          i18n,
          pinia({
            grossSalary: 10_000_000,
            savings: 20,
            assets: [
              { id: 'a1', name: 'CDT', value: 5_000_000, type: 'savings', annualRatePercent: 0 },
            ],
          }),
        ],
        stubs: chartStubs(),
      },
    })

    const chart = container.querySelector('[data-testid="savings-projection-chart"]')
    // Hypothetical present (>0 final value); compound absent (empty state instead).
    const hypoFinal = Number(chart?.getAttribute('data-hypothetical-final') ?? 0)
    expect(hypoFinal).toBeGreaterThan(0)
  })
})

describe('SavingsProjectionChart — unused import guard', () => {
  it('the imported component is the SFC, not undefined (compile-time sanity)', () => {
    expect(SavingsProjectionChart).toBeTruthy()
  })
})
