// T-010 — Covers: AC-2.1–2.4 · TC-I-003, TC-I-004, TC-I-005
import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import DashboardHero from '@/components/dashboard/DashboardHero.vue'
import SpendingPaceBadge from '@/components/dashboard/SpendingPaceBadge.vue'
import { i18n } from '@/i18n'

describe('SpendingPaceBadge (TC-I-003, TC-I-004, TC-I-005)', () => {
  it('TC-I-003 (AC-2.2): ahead pace renders red badge with arrow and context line', () => {
    render(SpendingPaceBadge, {
      props: { status: 'ahead', spentPct: 70, elapsedPct: 50 },
      global: { plugins: [i18n] },
    })
    const badge = screen.getByTestId('pace-badge')
    expect(badge.textContent).toContain('↑')
    expect(badge.textContent).toContain('20%')
    expect(badge.className).toMatch(/red/)
    const context = screen.getByTestId('pace-context').textContent ?? ''
    expect(context).toContain('Llevas el 70% del gasto del mes pasado y va el 50% del mes')
  })

  it('TC-I-004 (AC-2.3): below pace renders green badge', () => {
    render(SpendingPaceBadge, {
      props: { status: 'below', spentPct: 40, elapsedPct: 50 },
      global: { plugins: [i18n] },
    })
    const badge = screen.getByTestId('pace-badge')
    expect(badge.textContent).toContain('↓')
    expect(badge.className).toMatch(/emerald|green/)
    expect(screen.getByTestId('pace-context').textContent).toMatch(/por debajo del ritmo/)
  })

  it('TC-I-005 (AC-2.4): none renders neutral line without badge, NaN or 0%', () => {
    render(SpendingPaceBadge, {
      props: { status: 'none', spentPct: 0, elapsedPct: 30 },
      global: { plugins: [i18n] },
    })
    expect(screen.queryByTestId('pace-badge')).toBeNull()
    const context = screen.getByTestId('pace-context').textContent ?? ''
    expect(context).toContain('Desde el próximo mes verás tu comparación')
    expect(context).not.toMatch(/NaN|0%/)
  })
})

// Integration into the hero (AC-2.1)
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: { template: '<div />' } },
    { path: '/allocation', name: 'allocation', component: { template: '<div />' } },
    { path: '/income', name: 'income', component: { template: '<div />' } },
  ],
})

function mountHeroWithPace() {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 5, 15, 10, 0, 0)) // June 15 → elapsed 50%
  return render(DashboardHero, {
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
                lastMonthSeen: '2026-06',
                projectionAnnualRatePercent: 0,
                userName: '',
              },
            },
            income: {
              state: {
                grossSalary: 5_000_000,
                deductions: [],
                otherStreams: [],
                nonSalaryBenefits: [],
              },
            },
            expenses: { state: { items: [] } },
            cards: { state: { items: [] } },
            goals: { state: { items: [] } },
            assets: { state: { items: [] } },
            variableExpenses: {
              state: {
                items: [
                  {
                    id: 'v1',
                    name: 'Mercado',
                    budget: 1_000_000,
                    spent: 700_000,
                    categoryId: 'food',
                  },
                ],
              },
            },
            allocation: { state: { needs: 50, wants: 30, savings: 20 } },
            snapshots: {
              state: {
                items: [
                  {
                    id: 's1',
                    month: '2026-05',
                    capturedAt: '2026-06-01T00:00:00.000Z',
                    netIncome: 4_000_000,
                    totalFixedExpenses: 1_000_000,
                    totalVariableSpent: 1_000_000,
                    totalDebt: 0,
                    dti: 0,
                    savingsRate: 0,
                    netWorth: 0,
                    healthScore: 70,
                    debtPayments: 0,
                  },
                ],
              },
            },
          },
        }),
      ],
    },
  })
}

afterEach(() => {
  vi.useRealTimers()
})

describe('DashboardHero + pace (TC-I-003, AC-2.1)', () => {
  it('mounts the pace badge next to the available amount when history exists', () => {
    mountHeroWithPace()
    expect(screen.getByTestId('hero-available')).toBeTruthy()
    expect(screen.getByTestId('pace-badge')).toBeTruthy()
    expect(screen.getByTestId('pace-context')).toBeTruthy()
  })
})
