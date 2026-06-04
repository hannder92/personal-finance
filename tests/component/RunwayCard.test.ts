import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import RunwayCard from '@/components/dashboard/RunwayCard.vue'
import { i18n } from '@/i18n'

function mountRunway(piniaState: Record<string, unknown> = {}) {
  return render(RunwayCard, {
    global: {
      plugins: [
        i18n,
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
                onboarding: { done: true, currentStep: 0 },
              },
            },
            expenses: { state: { items: [] } },
            assets: { state: { items: [] } },
            variableExpenses: { state: { items: [] } },
            ...piniaState,
          },
        }),
      ],
    },
  })
}

describe('RunwayCard (20260529-metricas-runway-ingresos)', () => {
  it('TC-C-060 (AC-1.1): shows runway months when liquid and living expense are positive', () => {
    mountRunway({
      assets: {
        state: {
          items: [
            {
              id: 'a1',
              name: 'Ahorros',
              value: 30_000_000,
              type: 'savings',
              annualRatePercent: 0,
            },
          ],
        },
      },
      expenses: {
        state: {
          items: [{ id: 'e1', name: 'Arriendo', amount: 5_000_000, category: 'vivienda' }],
        },
      },
    })

    expect(screen.getByText(/runway|autonomía/i)).toBeTruthy()
    expect(screen.getByTestId('runway-months')).toBeTruthy()
    expect(screen.getByTestId('runway-months').textContent).toMatch(/6/)
  })

  it('TC-C-060 (AC-1.4): shows unavailable state when liquid is zero', () => {
    mountRunway({
      expenses: {
        state: {
          items: [{ id: 'e1', name: 'Arriendo', amount: 5_000_000, category: 'vivienda' }],
        },
      },
    })

    expect(screen.getByTestId('runway-unavailable')).toBeTruthy()
    expect(screen.getByTestId('runway-unavailable').textContent).toMatch(
      /sin patrimonio líquido|no liquid/i
    )
  })
})
