// Tests for DashboardView empty-state CTAs.
// Feature: 20260516-sprint1-mejoras-finanzas · Covers AC-3.1..3.4 · TC-C-012..015.
//
// RED today because DashboardView does not render any empty-state guide;
// the EmptyStateGuide component is implemented in T-016.

import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import DashboardView from '@/views/DashboardView.vue'
import { useIncomeStore } from '@/stores/incomeStore'
import { i18n } from '@/i18n'

function defaultSettingsState() {
  return {
    lang: 'es',
    currency: 'COP',
    theme: 'system',
    payoffMethod: 'avalanche',
    lastMonthSeen: null,
    onboarding: { done: true, currentStep: 0, totalSteps: 3 },
  }
}

const Stub = defineComponent({ name: 'StubView', render: () => h('div') })
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: Stub },
    { path: '/income', name: 'income', component: Stub },
    { path: '/expenses', name: 'expenses', component: Stub },
  ],
})

function mount(options: {
  grossSalary?: number
  expenses?: Array<{ id: string; name: string; amount: number; category: string }>
} = {}) {
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
                deductions: [],
                otherStreams: [],
                nonSalaryBenefits: [],
              },
            },
            expenses: { state: { items: options.expenses ?? [] } },
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
        BudgetDonut: { template: '<div data-testid="budget-donut"></div>' },
        ProjectionChart: { template: '<div data-testid="projection-chart"></div>' },
        SavingsProjectionChart: { template: '<div data-testid="savings-projection"></div>' },
      },
    },
  })
}

describe('DashboardView empty-state CTAs — sprint1 (AC-3.1..3.4)', () => {
  function emptyStateBox() {
    return document.querySelector('[data-testid="dashboard-empty-state"]') as HTMLElement | null
  }
  function ctaLinkInBox(box: HTMLElement | null) {
    return box?.querySelector('a') as HTMLAnchorElement | null
  }

  it('TC-C-012 (AC-3.1): grossSalary=0 → income CTA visible and links to /income', async () => {
    mount({ grossSalary: 0 })
    await nextTick()
    const box = emptyStateBox()
    expect(box).toBeTruthy()
    const link = ctaLinkInBox(box)
    expect(link?.getAttribute('href')).toBe('/income')
    expect(link?.textContent ?? '').toMatch(/registr.*ingreso|agreg.*ingreso/i)
  })

  it('TC-C-013 (AC-3.2): income set + no expenses → expenses CTA visible and links to /expenses', async () => {
    mount({ grossSalary: 3_000_000, expenses: [] })
    await nextTick()
    const box = emptyStateBox()
    expect(box).toBeTruthy()
    const link = ctaLinkInBox(box)
    expect(link?.getAttribute('href')).toBe('/expenses')
    expect(link?.textContent ?? '').toMatch(/registr.*gasto|agreg.*gasto/i)
  })

  it('TC-C-014 (AC-3.3): income CTA disappears reactively when grossSalary becomes > 0', async () => {
    mount({ grossSalary: 0 })
    await nextTick()
    const initialBox = emptyStateBox()
    expect(initialBox).toBeTruthy()
    expect(ctaLinkInBox(initialBox)?.getAttribute('href')).toBe('/income')

    const income = useIncomeStore()
    income.setGrossSalary(3_000_000)
    await nextTick()

    const afterBox = emptyStateBox()
    // After income is set, empty-state may still show (expenses CTA), but income CTA gone.
    expect(ctaLinkInBox(afterBox)?.getAttribute('href')).not.toBe('/income')
  })

  it('TC-C-015 (AC-3.4): with income but no expenses → "Ingreso neto" KPI visible AND expenses CTA visible', async () => {
    mount({ grossSalary: 3_000_000, expenses: [] })
    await nextTick()
    expect(screen.queryByText(/ingreso neto/i)).toBeTruthy()
    const box = emptyStateBox()
    expect(box).toBeTruthy()
    expect(ctaLinkInBox(box)?.getAttribute('href')).toBe('/expenses')
  })
})
