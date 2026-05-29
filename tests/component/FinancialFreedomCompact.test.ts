import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import FinancialFreedomCompact from '@/components/dashboard/FinancialFreedomCompact.vue'
import { i18n } from '@/i18n'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: { template: '<div />' } },
    { path: '/financial-freedom', name: 'financialFreedom', component: { template: '<div />' } },
  ],
})

describe('FinancialFreedomCompact', () => {
  it('TC-C-051 (AC-5.5, AC-5.6): progress, target and link to detail', () => {
    render(FinancialFreedomCompact, {
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
              income: {
                state: {
                  grossSalary: 10_000_000,
                  deductions: [],
                  otherStreams: [],
                  nonSalaryBenefits: [],
                },
              },
              expenses: {
                state: {
                  items: [{ id: 'e1', name: 'Rent', amount: 4_000_000, category: 'vivienda' }],
                },
              },
              cards: { state: { items: [] } },
              assets: {
                state: {
                  items: [
                    {
                      id: 'a1',
                      name: 'Cash',
                      value: 10_000_000,
                      type: 'cash',
                      annualRatePercent: 0,
                    },
                  ],
                },
              },
              allocation: { state: { needs: 50, wants: 30, savings: 20 } },
            },
          }),
        ],
      },
    })
    expect(screen.getByTestId('fi-compact-progress')).toBeTruthy()
    expect(screen.getByTestId('fi-compact-target')).toBeTruthy()
    const link = screen.getByRole('link', { name: /ver detalle|view details/i })
    expect(link.getAttribute('href')).toMatch(/financial-freedom/)
  })
})
