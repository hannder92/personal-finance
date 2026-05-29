import { render } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import KpiStrip from '@/components/dashboard/KpiStrip.vue'
import { i18n } from '@/i18n'

describe('KpiStrip (TC-C-006, TC-C-007)', () => {
  it('TC-C-006: renders without free/disponible duplicate card', () => {
    const { container } = render(KpiStrip, {
      global: {
        plugins: [
          i18n,
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              settings: {
                state: { currency: 'COP', lang: 'es', theme: 'system', payoffMethod: 'avalanche' },
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
              allocation: { state: { needs: 50, wants: 30, savings: 20 } },
            },
          }),
        ],
      },
    })
    const strip = container.querySelector('[data-testid="kpi-strip"]')!
    expect(strip.querySelectorAll('article').length).toBe(4)
    expect(container.textContent).not.toMatch(/disponible/i)
  })

  it('TC-C-007: uses horizontal scroll container', () => {
    const { container } = render(KpiStrip, {
      global: {
        plugins: [
          i18n,
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              settings: {
                state: { currency: 'COP', lang: 'es', theme: 'system', payoffMethod: 'avalanche' },
              },
              income: {
                state: { grossSalary: 0, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
              },
              expenses: { state: { items: [] } },
              cards: { state: { items: [] } },
            },
          }),
        ],
      },
    })
    const strip = container.querySelector('[data-testid="kpi-strip"]') as HTMLElement
    expect(strip.className).toMatch(/overflow-x-auto/)
  })
})
