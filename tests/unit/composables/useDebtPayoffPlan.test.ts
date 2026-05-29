import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useDebtPayoffPlan } from '@/composables/useDebtPayoffPlan'

function runPlan(initialState: Parameters<typeof createTestingPinia>[0]['initialState']) {
  let plan!: ReturnType<typeof useDebtPayoffPlan>
  mount(
    defineComponent({
      setup() {
        plan = useDebtPayoffPlan()
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
  return plan
}

describe('composables/useDebtPayoffPlan', () => {
  it('TC-U-008 (AC-4.2): extra payment simulation returns savings', () => {
    const plan = runPlan({
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
      cards: {
        state: {
          items: [
            {
              id: 'c1',
              name: 'Visa',
              type: 'card',
              balance: 2_000_000,
              apr: 24,
              minPayment: 100_000,
              installments: [],
            },
          ],
        },
      },
    })
    const result = plan.simulateExtraPayment('c1', 50_000)
    expect(result.monthsSaved).toBeGreaterThan(0)
    expect(result.interestSaved).toBeGreaterThan(0)
  })

  it('TC-U-007 (AC-4.1, AC-4.4): debt-free date and sorted ids for two debts', () => {
    const plan = runPlan({
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
      cards: {
        state: {
          items: [
            {
              id: 'low-apr',
              name: 'Loan',
              type: 'card',
              balance: 2_000_000,
              apr: 15,
              minPayment: 150_000,
              installments: [],
            },
            {
              id: 'high-apr',
              name: 'Card',
              type: 'card',
              balance: 1_000_000,
              apr: 30,
              minPayment: 100_000,
              installments: [],
            },
          ],
        },
      },
    })
    expect(plan.debtFreeDate.value).toBeInstanceOf(Date)
    expect(plan.sortedDebtIds.value[0]).toBe('high-apr')
  })
})
