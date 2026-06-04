// Tests for DashboardView wiring with composables and reactivity.
// Feature: 20260515-fix-calculos-financieros
// Covers AC-2.2, AC-3.4, AC-3.5, AC-3.6, AC-5.3 · TC-C-002, TC-C-003, TC-C-004, TC-C-005, TC-C-006.
// Today DashboardView uses income.state.grossSalary directly and hardcodes breakdown values
// (emergency: 70, housing: 25). After T-028 it switches to useNetIncome / useHealthScore.

import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import { useAssetsStore } from '@/stores/assetsStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { i18n } from '@/i18n'

function defaultSettingsState() {
  return {
    lang: 'es',
    currency: 'COP',
    theme: 'system',
    payoffMethod: 'avalanche',
    lastMonthSeen: null,
    projectionAnnualRatePercent: 0,
  }
}

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: { template: '<div />' } },
    { path: '/allocation', name: 'allocation', component: { template: '<div />' } },
  ],
})

async function expandHealthBreakdown() {
  const toggle = screen.getByText(/puntaje de salud|health score/i).closest('button')
  expect(toggle).toBeTruthy()
  await fireEvent.click(toggle!)
}

function mount(
  options: {
    grossSalary?: number
    deductions?: Array<{ id: string; label: string; amount: number; type: 'fixed' | 'percent' }>
    assets?: Array<{ id: string; name: string; value: number; type: string }>
    expenses?: Array<{ id: string; name: string; amount: number; category: string }>
  } = {}
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
            settings: { state: defaultSettingsState() },
            income: {
              state: {
                grossSalary: options.grossSalary ?? 0,
                deductions: options.deductions ?? [],
                otherStreams: [],
                nonSalaryBenefits: [],
              },
            },
            expenses: { state: { items: options.expenses ?? [] } },
            cards: { state: { items: [] } },
            goals: { state: { items: [] } },
            assets: { state: { items: options.assets ?? [] } },
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
            '<div data-testid="projection-chart" :data-base="months && months.length ? months[0].balance : 0"></div>',
        },
        SavingsProjectionChart: {
          template: '<div data-testid="savings-projection-chart"></div>',
        },
      },
    },
  })
}

describe('DashboardView — fix-calculos-financieros (reactive wiring)', () => {
  it('TC-C-002 (AC-2.2): KPIs reflect net income, not gross, when deductions are configured', () => {
    mount({
      grossSalary: 12_100_000,
      deductions: [
        { id: 'd1', label: 'Salud', amount: 4, type: 'percent' },
        { id: 'd2', label: 'Pensión', amount: 4, type: 'percent' },
      ],
    })
    // Net = 12.1M × 0.92 = 11.132.000. Look for it formatted as Colombian peso anywhere in the view.
    // Today the dashboard renders 12.100.000 (gross) for distribution/disposable, so this fails.
    const candidates = screen.queryAllByText(/11\.?132\.?000|11 132 000/)
    expect(candidates.length).toBeGreaterThan(0)
  })

  it('TC-C-003 (AC-3.4): with empty assets store, emergency component shows a "sin datos" indicator', async () => {
    mount({ grossSalary: 5_000_000 })
    await expandHealthBreakdown()
    const emergencyRow = document.querySelector('[data-component="emergency"]')
    expect(emergencyRow?.getAttribute('data-status')).toBe('missing')
  })

  it('TC-C-004 (AC-3.5): adding a liquid savings asset re-renders the emergency component value', async () => {
    mount({ grossSalary: 5_000_000 })
    await expandHealthBreakdown()
    const assets = useAssetsStore()
    const before = document
      .querySelector('[data-component="emergency"]')
      ?.getAttribute('data-status')
    assets.add({ name: 'Ahorro', value: 6_000_000, type: 'savings' })
    await nextTick()
    const after = document
      .querySelector('[data-component="emergency"]')
      ?.getAttribute('data-status')
    // Reactivity expectation: the status changed because real data arrived.
    expect(after).not.toBe(before)
  })

  it('TC-C-005 (AC-3.6): adding a housing expense re-renders the housing component', async () => {
    mount({ grossSalary: 5_000_000 })
    await expandHealthBreakdown()
    const expenses = useExpensesStore()
    const before = screen
      .queryByText(/vivienda|housing/i)
      ?.closest('[data-status]')
      ?.getAttribute('data-status')
    expenses.add({ name: 'Arriendo', amount: 1_500_000, category: 'vivienda' })
    await nextTick()
    const after = screen
      .queryByText(/vivienda|housing/i)
      ?.closest('[data-status]')
      ?.getAttribute('data-status')
    expect(after).not.toBe(before)
  })

  it('TC-C-006 (AC-5.3): ProjectionChart receives a balance derived from NET income, not gross', () => {
    mount({
      grossSalary: 12_100_000,
      deductions: [
        { id: 'd1', label: 'Salud', amount: 4, type: 'percent' },
        { id: 'd2', label: 'Pensión', amount: 4, type: 'percent' },
      ],
    })
    const chart = screen.queryByTestId('projection-chart')
    expect(chart).toBeTruthy()
    // The first month's balance should be based on net income (11.132M for no fixed/debt).
    // Today DashboardView uses gross (12.1M) → assertion fails.
    const base = Number(chart?.getAttribute('data-base') ?? 0)
    expect(base).toBe(11_132_000)
  })
})
