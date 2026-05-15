import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import GoalList from '@/components/goals/GoalList.vue'
import { useGoalsStore } from '@/stores/goalsStore'

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
  savingsBucket = 500_000
) {
  return render(GoalList, {
    props: { savingsBucket, currency: 'COP' },
    global: {
      plugins: [
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
            goals: { state: { items } },
          },
        }),
      ],
    },
  })
}

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
