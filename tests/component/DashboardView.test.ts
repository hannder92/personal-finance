import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import { i18n } from '@/i18n'
import { DASHBOARD_TIER2_SESSION_KEY } from '@/lib/dashboard-tier2-storage'
import { mockIsDesktop } from '../helpers/mockMediaQuery'

vi.mock('@vueuse/core', () => ({
  useMediaQuery: () => mockIsDesktop,
}))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: { template: '<div />' } },
    { path: '/allocation', name: 'allocation', component: { template: '<div />' } },
    { path: '/networth', component: { template: '<div />' } },
    { path: '/debts', component: { template: '<div />' } },
  ],
})

function mockSessionStorage() {
  const map = new Map<string, string>()
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => map.set(key, value),
    removeItem: (key: string) => map.delete(key),
    clear: () => map.clear(),
    key: () => null,
    length: 0,
  } as Storage)
}

function mountDashboard(overrides: { grossSalary?: number } = {}) {
  mockSessionStorage()
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
                projectionAnnualRatePercent: 0,
              },
            },
            income: {
              state: {
                grossSalary: overrides.grossSalary ?? 5_000_000,
                deductions: [],
                otherStreams: [],
                nonSalaryBenefits: [],
              },
            },
            expenses: { state: { items: [] } },
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
        ProjectionChart: { template: '<div data-testid="projection-chart" />' },
        SavingsProjectionChart: { template: '<div data-testid="savings-projection-chart" />' },
      },
    },
  })
}

describe('DashboardView — mi-dia-cobertura (20260530)', () => {
  beforeEach(() => {
    mockIsDesktop.value = false
  })

  it('TC-C-075 (AC-4.1): day overview precedes dashboard hero', () => {
    mountDashboard()
    const day = screen.getByTestId('data-day-overview')
    const hero = screen.getByTestId('data-dashboard-hero')
    expect(day.compareDocumentPosition(hero)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })
})

describe('DashboardView — progressive disclosure (20260604)', () => {
  beforeEach(() => {
    mockIsDesktop.value = false
  })

  it('TC-C-080 (AC-1.1): tier 2 hidden by default on mobile', () => {
    mountDashboard()
    expect(screen.queryByTestId('dashboard-tier-2')).toBeNull()
    expect(screen.queryByTestId('kpi-strip')).toBeNull()
  })

  it('TC-C-081 (AC-1.2): order day → hero → toggle', () => {
    mountDashboard()
    const day = screen.getByTestId('data-day-overview')
    const hero = screen.getByTestId('data-dashboard-hero')
    const toggle = screen.getByTestId('dashboard-tier2-toggle')
    expect(day.compareDocumentPosition(hero)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(hero.compareDocumentPosition(toggle)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('TC-C-085 (AC-2.2): expand reveals tier 2 with KPI strip', async () => {
    mountDashboard()
    await fireEvent.click(screen.getByTestId('dashboard-tier2-toggle'))
    expect(screen.getByTestId('dashboard-tier-2')).toBeTruthy()
    expect(screen.getByTestId('kpi-strip')).toBeTruthy()
  })

  it('TC-C-086 (AC-2.3): collapse hides tier 2', async () => {
    mountDashboard()
    await fireEvent.click(screen.getByTestId('dashboard-tier2-toggle'))
    await fireEvent.click(screen.getByTestId('dashboard-tier2-toggle'))
    expect(screen.queryByTestId('dashboard-tier-2')).toBeNull()
    expect(screen.getByTestId('dashboard-tier2-toggle').textContent).toBe('Ver análisis del mes')
  })

  it('TC-C-088 (AC-4.1): no toggle on desktop', () => {
    mockIsDesktop.value = true
    mountDashboard()
    expect(screen.queryByTestId('dashboard-tier2-toggle')).toBeNull()
  })

  it('TC-C-089 (AC-4.2): tier 2 visible on desktop without interaction', () => {
    mockIsDesktop.value = true
    mountDashboard()
    expect(screen.getByTestId('dashboard-tier-2')).toBeTruthy()
    expect(screen.getByTestId('kpi-strip')).toBeTruthy()
  })

  it('TC-C-090 (AC-5.1): no income hides tier 2 and toggle', () => {
    sessionStorage.setItem(DASHBOARD_TIER2_SESSION_KEY, 'true')
    mountDashboard({ grossSalary: 0 })
    expect(screen.queryByTestId('dashboard-tier-2')).toBeNull()
    expect(screen.queryByTestId('dashboard-tier2-toggle')).toBeNull()
  })
})
