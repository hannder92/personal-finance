import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import DueDateAlerts from '@/components/debts/DueDateAlerts.vue'

function plusDays(days: number): string {
  const d = new Date(2026, 4, 15)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

describe('DueDateAlerts (AC-5.7 TC-C-016)', () => {
  const today = new Date(2026, 4, 15)

  it('AC-5.7 TC-C-016: shows alert when a card dueDate is within 7 days', () => {
    render(DueDateAlerts, {
      props: {
        cards: [
          {
            id: 'c1',
            type: 'card',
            name: 'Visa Oro',
            balance: 2_000_000,
            limit: 5_000_000,
            apr: 24,
            minPayment: 100_000,
            dueDate: plusDays(3),
            installments: [],
          },
        ],
        today,
      },
    })

    expect(screen.getByText(/Visa Oro/)).toBeTruthy()
    expect(screen.getByText(/100\.000/)).toBeTruthy()
  })

  it('AC-5.7 TC-C-016: no alert when dueDate is beyond 7 days', () => {
    render(DueDateAlerts, {
      props: {
        cards: [
          {
            id: 'c1',
            type: 'card',
            name: 'Visa Oro',
            balance: 2_000_000,
            limit: 5_000_000,
            apr: 24,
            minPayment: 100_000,
            dueDate: plusDays(10),
            installments: [],
          },
        ],
        today,
      },
    })

    expect(screen.queryByText(/Visa Oro/)).toBeNull()
  })
})
