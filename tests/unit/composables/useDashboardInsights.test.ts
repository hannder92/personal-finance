/**
 * Planificación integrada — extend in T-014 (TC-U-005) and T-019 (TC-C-042):
 * AC-1.5 donut vs objective; AC-2.3 flow insight from calcProjection tail.
 */
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useDashboardInsights } from '@/composables/useDashboardInsights'
import { i18n } from '@/i18n'

function runInsights(initialState: Parameters<typeof createTestingPinia>[0]['initialState']) {
  let insights!: ReturnType<typeof useDashboardInsights>
  mount(
    defineComponent({
      setup() {
        insights = useDashboardInsights()
        return () => null
      },
    }),
    {
      global: {
        plugins: [
          i18n,
          createTestingPinia({
            createSpy: vi.fn,
            stubActions: false,
            initialState,
          }),
        ],
      },
    }
  )
  return insights
}

describe('useDashboardInsights (TC-U-010, TC-U-011, TC-U-012)', () => {
  it('TC-U-010: donut insight includes savings amount and percent', () => {
    i18n.global.locale.value = 'es'
    const insights = runInsights({
      settings: {
        state: { currency: 'COP', lang: 'es', theme: 'system', payoffMethod: 'avalanche' },
      },
      income: {
        state: { grossSalary: 10_000_000, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
      },
      expenses: { state: { items: [] } },
      cards: { state: { items: [] } },
      allocation: { state: { needs: 50, wants: 30, savings: 20 } },
    })
    expect(insights.hasDonutData.value).toBe(true)
    expect(insights.donutInsight.value).toMatch(/2\.000\.000|2,000,000/)
    expect(insights.donutInsight.value).toMatch(/20/)
  })

  it('TC-U-011: projection insight mentions 12-month accumulation', () => {
    const insights = runInsights({
      settings: {
        state: { currency: 'COP', lang: 'es', theme: 'system', payoffMethod: 'avalanche' },
      },
      income: {
        state: { grossSalary: 12_000_000, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
      },
      expenses: { state: { items: [] } },
      cards: { state: { items: [] } },
      allocation: { state: { needs: 50, wants: 30, savings: 20 } },
    })
    expect(insights.hasProjectionData.value).toBe(true)
    expect(insights.projectionInsight.value).toBeTruthy()
  })

  it('TC-U-005 (AC-1.5): donut insight does not mention cumulative cash flow', () => {
    i18n.global.locale.value = 'es'
    const insights = runInsights({
      settings: {
        state: { currency: 'COP', lang: 'es', theme: 'system', payoffMethod: 'avalanche' },
      },
      income: {
        state: { grossSalary: 10_000_000, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
      },
      expenses: { state: { items: [] } },
      cards: { state: { items: [] } },
      allocation: { state: { needs: 50, wants: 30, savings: 20 } },
    })
    expect(insights.donutInsight.value).toBeTruthy()
    expect(insights.donutInsight.value).not.toMatch(/flujo de caja acumulado/i)
  })

  it('TC-U-005 (AC-2.3): projection insight describes cash flow, not savings rule', () => {
    i18n.global.locale.value = 'es'
    const insights = runInsights({
      settings: {
        state: { currency: 'COP', lang: 'es', theme: 'system', payoffMethod: 'avalanche' },
      },
      income: {
        state: { grossSalary: 10_000_000, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
      },
      expenses: { state: { items: [] } },
      cards: { state: { items: [] } },
      allocation: { state: { needs: 50, wants: 30, savings: 20 } },
    })
    expect(insights.projectionInsight.value).toBeTruthy()
    expect(insights.projectionInsight.value).toMatch(/flujo de caja/i)
    expect(insights.projectionInsight.value).not.toMatch(/Destinas/i)
  })

  it('TC-U-012: no insight when no income', () => {
    const insights = runInsights({
      settings: {
        state: { currency: 'COP', lang: 'es', theme: 'system', payoffMethod: 'avalanche' },
      },
      income: {
        state: { grossSalary: 0, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
      },
      expenses: { state: { items: [] } },
      cards: { state: { items: [] } },
      allocation: { state: { needs: 0, wants: 0, savings: 0 } },
    })
    expect(insights.hasDonutData.value).toBe(false)
    expect(insights.donutInsight.value).toBeNull()
  })
})
