import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useCashFlowProjection } from '@/composables/useCashFlowProjection'

function runProjection(initialState: Parameters<typeof createTestingPinia>[0]['initialState']) {
  let projection!: ReturnType<typeof useCashFlowProjection>
  mount(
    defineComponent({
      setup() {
        projection = useCashFlowProjection()
        return () => null
      },
    }),
    {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            stubActions: false,
            initialState,
          }),
        ],
      },
    }
  )
  return projection
}

const baseSettings = {
  lang: 'es',
  currency: 'COP',
  theme: 'system',
  payoffMethod: 'avalanche',
  lastMonthSeen: null,
  onboarding: { done: true, currentStep: 0, totalSteps: 3 },
}

describe('composables/useCashFlowProjection', () => {
  it('TC-U-003 (AC-2.1): month 1 balance equals net minus fixed and debt', () => {
    const projection = runProjection({
      settings: { state: baseSettings },
      income: {
        state: {
          grossSalary: 12_100_000,
          deductions: [
            { id: 'd1', label: 'Salud', amount: 4, type: 'percent' },
            { id: 'd2', label: 'Pensión', amount: 4, type: 'percent' },
          ],
          otherStreams: [],
          nonSalaryBenefits: [],
        },
      },
      expenses: { state: { items: [] } },
      cards: { state: { items: [] } },
    })
    const months = projection.months.value
    expect(months.length).toBeGreaterThanOrEqual(1)
    expect(months[0]!.projectedBalance).toBe(11_132_000)
  })

  it('TC-U-003 (AC-2.2): semiannual stream lifts balance at month 6 vs month 5', () => {
    const projection = runProjection({
      settings: { state: baseSettings },
      income: {
        state: {
          grossSalary: 10_000_000,
          deductions: [],
          otherStreams: [
            {
              id: 'bonus',
              label: 'Prima',
              amount: 6_000_000,
              frequency: 'semiannual',
            },
          ],
          nonSalaryBenefits: [],
        },
      },
      expenses: { state: { items: [] } },
      cards: { state: { items: [] } },
    })
    const months = projection.months.value
    expect(months.length).toBe(12)
    const m5 = months[4]!.projectedBalance
    const m6 = months[5]!.projectedBalance
    const m11 = months[10]!.projectedBalance
    const m12 = months[11]!.projectedBalance
    expect(m6).toBeGreaterThan(m5)
    expect(m12).toBeGreaterThan(m11)
  })
})
