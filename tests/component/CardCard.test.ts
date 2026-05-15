import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import CardCard from '@/components/debts/CardCard.vue'

describe('CardCard (AC-5.1 TC-C-014)', () => {
  it('AC-5.1 TC-C-014: card type shows utilization bar at 40% and a months timeline', () => {
    render(CardCard, {
      props: {
        card: {
          id: 'c1',
          type: 'card',
          name: 'Visa Oro',
          balance: 2_000_000,
          limit: 5_000_000,
          apr: 24,
          minPayment: 100_000,
          dueDate: null,
          installments: [],
        },
        currency: 'COP',
      },
    })

    const bar = document.querySelector('[role="progressbar"]') as HTMLElement
    expect(bar).toBeTruthy()
    expect(bar.getAttribute('aria-valuenow')).toBe('40')

    const text = document.body.textContent ?? ''
    expect(text.match(/\d+\s*meses/i)).toBeTruthy()
  })
})

describe('CardCard (AC-5.2 TC-C-015)', () => {
  it('AC-5.2 TC-C-015: loan type shows remaining installments, not a month timeline', () => {
    render(CardCard, {
      props: {
        card: {
          id: 'l1',
          type: 'loan',
          name: 'Crédito vehículo',
          balance: 8_000_000,
          apr: 18,
          minPayment: 500_000,
          remainingInstallments: 18,
        },
        currency: 'COP',
      },
    })

    expect(screen.getByText(/18\s*cuotas\s*restantes/i)).toBeTruthy()
    const text = document.body.textContent ?? ''
    expect(text.match(/\d+\s*meses/i)).toBeNull()
  })
})
