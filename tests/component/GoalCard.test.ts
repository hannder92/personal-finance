import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import GoalCard from '@/components/goals/GoalCard.vue'

describe('GoalCard (AC-7.1 AC-7.4 TC-C-018)', () => {
  it('AC-7.1 TC-C-018: in-progress goal shows 50% bar and positive ETA', () => {
    render(GoalCard, {
      props: {
        goal: {
          id: 'g1',
          name: 'Viaje',
          target: 6_000_000,
          saved: 3_000_000,
          monthlyContrib: 500_000,
          targetDate: null,
          priority: 0,
          invested: false,
        },
        currency: 'COP',
      },
      global: { plugins: [i18n, createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
    })

    const bar = document.querySelector('[role="progressbar"]') as HTMLElement
    expect(bar.getAttribute('aria-valuenow')).toBe('50')
    // ETA: remaining 3_000_000 / 500_000 = 6 months
    expect(screen.getByText(/6\s*meses/i)).toBeTruthy()
  })

  it('AC-7.4 TC-C-018 (EC-1 20261002): completed goal shows "lograda" indicator', () => {
    render(GoalCard, {
      props: {
        goal: {
          id: 'g1',
          name: 'Viaje',
          target: 6_000_000,
          saved: 6_000_000,
          monthlyContrib: 500_000,
          targetDate: null,
          priority: 0,
          invested: false,
        },
        currency: 'COP',
      },
      global: { plugins: [i18n, createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
    })
    expect(screen.getByText(/lograda/i)).toBeTruthy()
  })
})
