// T-014 — Covers: AC-6.2, AC-6.3 · TC-I-012, TC-I-015
import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import { i18n } from '@/i18n'
import en from '@/i18n/en.json'
import es from '@/i18n/es.json'
import { mockIsDesktop } from '../helpers/mockMediaQuery'

vi.mock('@vueuse/core', () => ({
  useMediaQuery: () => mockIsDesktop,
}))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: { template: '<div />' } },
    { path: '/allocation', name: 'allocation', component: { template: '<div />' } },
    { path: '/income', name: 'income', component: { template: '<div />' } },
    { path: '/networth', name: 'networth', component: { template: '<div />' } },
    { path: '/debts', name: 'debts', component: { template: '<div />' } },
    { path: '/variable', name: 'variable', component: { template: '<div />' } },
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

function mountDashboard() {
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
            assets: {
              state: {
                items: [
                  {
                    id: 'a1',
                    name: 'Ahorros',
                    value: 1_000_000,
                    type: 'savings',
                    annualRatePercent: 0,
                  },
                ],
              },
            },
            variableExpenses: { state: { items: [] } },
            allocation: { state: { needs: 50, wants: 30, savings: 20 } },
            snapshots: { state: { items: [] } },
          },
        }),
      ],
      stubs: {
        ProjectionChart: { template: '<div data-testid="projection-chart" />' },
        SavingsProjectionChart: { template: '<div data-testid="savings-projection-chart" />' },
        CashFlowChart: { template: '<div data-testid="cashflow-chart-stub" />' },
      },
    },
  })
}

function expectBefore(a: HTMLElement, b: HTMLElement) {
  expect(a.compareDocumentPosition(b)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
}

describe('DashboardView — redesigned layout (TC-I-012)', () => {
  beforeEach(() => {
    mockIsDesktop.value = false
  })

  it('AC-6.2: section order greeting → day → hero → networth → flow grid → toggle', () => {
    mountDashboard()
    const greeting = screen.getByTestId('dashboard-greeting')
    const day = screen.getByTestId('data-day-overview')
    const hero = screen.getByTestId('data-dashboard-hero')
    const networth = screen.getByTestId('networth-cards')
    const flowGrid = screen.getByTestId('dashboard-flow-grid')
    const toggle = screen.getByTestId('dashboard-tier2-toggle')
    expectBefore(greeting, day)
    expectBefore(day, hero)
    expectBefore(hero, networth)
    expectBefore(networth, flowGrid)
    expectBefore(flowGrid, toggle)
  })

  it('AC-6.2: flow grid uses two columns on md+ viewports', () => {
    mountDashboard()
    expect(screen.getByTestId('dashboard-flow-grid').className).toMatch(/md:grid-cols-2/)
  })

  it('AC-6.3: new sections live outside the collapsible tier-2 container', async () => {
    mountDashboard()
    await fireEvent.click(screen.getByTestId('dashboard-tier2-toggle'))
    const tier2 = screen.getByTestId('dashboard-tier-2')
    expect(tier2.contains(screen.getByTestId('networth-cards'))).toBe(false)
    expect(tier2.contains(screen.getByTestId('dashboard-flow-grid'))).toBe(false)
    expect(tier2.querySelector('[data-testid="kpi-strip"]')).toBeTruthy()
  })

  it('AC-6.3: tier-2 stays hidden by default on mobile (signed spec regression)', () => {
    mountDashboard()
    expect(screen.queryByTestId('dashboard-tier-2')).toBeNull()
  })

  it('AC-6.3: tier-2 always visible on desktop without toggle (signed spec regression)', () => {
    mockIsDesktop.value = true
    mountDashboard()
    expect(screen.getByTestId('dashboard-tier-2')).toBeTruthy()
    expect(screen.queryByTestId('dashboard-tier2-toggle')).toBeNull()
  })
})

describe('i18n parity for new namespaces (TC-I-015)', () => {
  function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
    const keys: string[] = []
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        keys.push(...collectKeys(value as Record<string, unknown>, path))
      } else {
        keys.push(path)
      }
    }
    return keys
  }

  it('settings.* keys exist in both locales (dashboard.* covered by existing parity test)', () => {
    const esKeys = collectKeys(es as Record<string, unknown>).filter((k) =>
      k.startsWith('settings.')
    )
    const enKeys = new Set(
      collectKeys(en as Record<string, unknown>).filter((k) => k.startsWith('settings.'))
    )
    expect(esKeys.length).toBeGreaterThan(0)
    for (const key of esKeys) expect(enKeys.has(key)).toBe(true)
  })

  it('new dashboard namespaces are present', () => {
    const esKeys = new Set(collectKeys(es as Record<string, unknown>))
    for (const key of [
      'dashboard.greeting.morning',
      'dashboard.pace.contextAhead',
      'dashboard.networth.have',
      'dashboard.flow.title',
      'dashboard.activity.title',
    ]) {
      expect(esKeys.has(key)).toBe(true)
    }
  })
})
