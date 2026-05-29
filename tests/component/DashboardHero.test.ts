import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import DashboardHero from '@/components/dashboard/DashboardHero.vue'
import { i18n } from '@/i18n'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: { template: '<div />' } },
    { path: '/allocation', name: 'allocation', component: { template: '<div />' } },
    { path: '/income', name: 'income', component: { template: '<div />' } },
  ],
})

function mountHero(grossSalary = 10_000_000, snapshots: Array<{ healthScore: number }> = []) {
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
              state: { currency: 'COP', lang: 'es', theme: 'system', payoffMethod: 'avalanche' },
            },
            income: {
              state: { grossSalary, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
            },
            expenses: { state: { items: [] } },
            cards: { state: { items: [] } },
            goals: { state: { items: [] } },
            assets: { state: { items: [] } },
            allocation: { state: { needs: 50, wants: 30, savings: 20 } },
            snapshots: {
              state: {
                items: snapshots.map((s, i) => ({
                  id: `s${i}`,
                  month: `2026-0${i + 1}`,
                  capturedAt: '',
                  netIncome: 0,
                  totalFixedExpenses: 0,
                  totalVariableSpent: 0,
                  totalDebt: 0,
                  dti: 0,
                  savingsRate: 0,
                  netWorth: 0,
                  healthScore: s.healthScore,
                })),
              },
            },
          },
        }),
      ],
    },
    container: document.body,
  })
}

describe('DashboardHero (TC-C-001 … TC-C-005)', () => {
  it('TC-C-001: shows available amount prominently', () => {
    mountHero()
    const hero = screen.getByTestId('hero-available')
    expect(hero).toBeTruthy()
    expect(hero.className).toMatch(/text-3xl|text-4xl/)
  })

  it('TC-C-002: health score is smaller than available', () => {
    mountHero()
    const available = screen.getByTestId('hero-available')
    const health = screen.getByTestId('hero-health-score')
    expect(available.compareDocumentPosition(health)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(available.className).toMatch(/text-3xl|text-4xl/)
    expect(health.textContent).toMatch(/\d+/)
  })

  it('TC-C-003: empty income shows CTA to income', () => {
    mountHero(0)
    expect(screen.queryByTestId('hero-available')).toBeNull()
    expect(screen.getByText(/configura tu ingreso/i)).toBeTruthy()
    expect(screen.getByRole('link', { name: /ingresos/i }).getAttribute('href')).toBe('/income')
  })

  it('TC-C-004: shows comparison badge when previous snapshot exists', () => {
    mountHero(10_000_000, [{ healthScore: 60 }])
    expect(screen.getByText(/vs mes anterior/i)).toBeTruthy()
  })

  it('TC-C-005: shows allocation CTA when available > 0', () => {
    mountHero()
    const cta = screen.getByTestId('cta-allocation')
    expect(cta.getAttribute('href')).toBe('/allocation')
  })
})
