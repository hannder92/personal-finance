/**
 * Planificación integrada — extend in T-024: TC-C-052 (AC-6.1, AC-6.2) feasibility caps.
 */
import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import GoalList from '@/components/goals/GoalList.vue'
import { useGoalsStore } from '@/stores/goalsStore'

function feasibilityPinia(
  items: Array<{
    id: string
    name: string
    target: number
    saved: number
    monthlyContrib: number
    targetDate: string | null
    priority: number
  }>
) {
  return createTestingPinia({
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
        state: { grossSalary: 10_000_000, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
      },
      expenses: {
        state: { items: [{ id: 'e1', name: 'Rent', amount: 8_000_000, category: 'vivienda' }] },
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
      goals: { state: { items } },
    },
  })
}

function mount(
  items: Array<{
    id: string
    name: string
    target: number
    saved: number
    monthlyContrib: number
    targetDate: string | null
    priority: number
  }>,
  savingsBucket = 500_000,
  withFeasibility = false
) {
  return render(GoalList, {
    props: { savingsBucket, currency: 'COP' },
    global: {
      plugins: [
        withFeasibility
          ? feasibilityPinia(items)
          : createTestingPinia({
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
                goals: { state: { items } },
              },
            }),
      ],
    },
  })
}

describe('GoalList — planificación integrada (TC-C-052)', () => {
  it('TC-C-052 (AC-6.1): warns when contributions exceed min(rule, feasible)', () => {
    mount(
      [
        {
          id: 'g1',
          name: 'Viaje',
          target: 6_000_000,
          saved: 0,
          monthlyContrib: 3_000_000,
          targetDate: null,
          priority: 0,
        },
      ],
      800_000,
      true
    )
    expect(screen.getByTestId('goals-feasibility-alert')).toBeTruthy()
    expect(screen.getByTestId('goals-feasibility-alert').textContent).toMatch(
      /2\.000\.000|2,000,000/
    )
    expect(screen.getByTestId('goals-feasibility-alert').textContent).toMatch(/800\.000|800,000/)
  })

  it('TC-C-052 (AC-6.2): shows rule cap and feasible cap when within limits', () => {
    mount(
      [
        {
          id: 'g1',
          name: 'Fondo',
          target: 5_000_000,
          saved: 0,
          monthlyContrib: 500_000,
          targetDate: null,
          priority: 0,
        },
      ],
      800_000,
      true
    )
    expect(screen.getByTestId('goals-rule-cap')).toBeTruthy()
    expect(screen.getByTestId('goals-feasible-cap')).toBeTruthy()
  })
})

describe('GoalList (AC-7.3 AC-7.5 TC-C-019)', () => {
  it('AC-7.3 TC-C-019: shows warning when sum of monthlyContrib exceeds savingsBucket', () => {
    mount(
      [
        {
          id: 'g1',
          name: 'Viaje',
          target: 6_000_000,
          saved: 0,
          monthlyContrib: 400_000,
          targetDate: null,
          priority: 0,
        },
        {
          id: 'g2',
          name: 'Emergencia',
          target: 10_000_000,
          saved: 0,
          monthlyContrib: 300_000,
          targetDate: null,
          priority: 1,
        },
      ],
      500_000
    )
    // 700_000 > 500_000 — overage
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByText(/excede|supera|overage/i)).toBeTruthy()
  })

  it('AC-7.3 TC-C-019: no warning when within savings bucket', () => {
    mount(
      [
        {
          id: 'g1',
          name: 'Viaje',
          target: 6_000_000,
          saved: 0,
          monthlyContrib: 200_000,
          targetDate: null,
          priority: 0,
        },
      ],
      500_000
    )
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('AC-7.5 TC-C-019: clicking "subir" reorders goals via goalsStore.reorder', async () => {
    mount([
      {
        id: 'g1',
        name: 'Viaje',
        target: 6_000_000,
        saved: 0,
        monthlyContrib: 200_000,
        targetDate: null,
        priority: 0,
      },
      {
        id: 'g2',
        name: 'Emergencia',
        target: 10_000_000,
        saved: 0,
        monthlyContrib: 200_000,
        targetDate: null,
        priority: 1,
      },
    ])
    const store = useGoalsStore()
    const spy = vi.spyOn(store, 'reorder')

    const upBtns = screen.getAllByRole('button', { name: /subir|up/i })
    // Click "up" on the second goal (Emergencia) → should move it before Viaje.
    await fireEvent.click(upBtns[1]!)

    expect(spy).toHaveBeenCalledWith(['g2', 'g1'])
  })
})
