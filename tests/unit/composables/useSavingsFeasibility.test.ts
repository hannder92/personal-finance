import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useSavingsFeasibility } from '@/composables/useSavingsFeasibility'

function runFeasibility(initialState: Parameters<typeof createTestingPinia>[0]['initialState']) {
  let feasibility!: ReturnType<typeof useSavingsFeasibility>
  mount(
    defineComponent({
      setup() {
        feasibility = useSavingsFeasibility()
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
  return feasibility
}

describe('composables/useSavingsFeasibility', () => {
  it('TC-U-004 (AC-6.1, AC-6.2): effectiveGoalCap is min(objective, feasible)', () => {
    const f = runFeasibility({
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
        state: { grossSalary: 10_000_000, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
      },
      expenses: {
        state: {
          items: [{ id: 'e1', name: 'Rent', amount: 8_000_000, category: 'vivienda' }],
        },
      },
      cards: {
        state: {
          items: [
            {
              id: 'c1',
              name: 'Card',
              type: 'card',
              balance: 1_000_000,
              limit: 2_000_000,
              apr: 24,
              minPayment: 1_200_000,
              installments: [],
            },
          ],
        },
      },
      allocation: { state: { needs: 50, wants: 30, savings: 20 } },
    })
    expect(f.objective.value).toBe(2_000_000)
    expect(f.feasible.value).toBe(800_000)
    expect(f.effectiveGoalCap.value).toBe(800_000)
  })
})
