import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import CardCard from '@/components/debts/CardCard.vue'
import { i18n } from '@/i18n'

const globalPlugins = { plugins: [i18n] }

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
      global: globalPlugins,
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
      global: globalPlugins,
    })

    expect(screen.getByText(/18\s*cuotas\s*restantes/i)).toBeTruthy()
    const text = document.body.textContent ?? ''
    expect(text.match(/\d+\s*meses/i)).toBeNull()
  })
})

describe('CardCard (20260529-metricas-runway-ingresos delete-in-card)', () => {
  const cardProps = {
    card: {
      id: 'c1',
      type: 'card' as const,
      name: 'Visa Oro',
      balance: 2_000_000,
      limit: 5_000_000,
      apr: 24,
      minPayment: 100_000,
      dueDate: null,
      installments: [],
    },
    currency: 'COP',
  }

  it('TC-C-065 (AC-5.1, AC-5.2): debt-delete-btn renders inside card article', () => {
    const { container } = render(CardCard, {
      props: { ...cardProps, showDelete: true },
      global: globalPlugins,
    })

    const article = container.querySelector('article')
    expect(article).toBeTruthy()
    expect(article?.querySelector('[data-testid="debt-delete-btn"]')).toBeTruthy()
  })

  it('TC-C-065 (AC-5.1): emits delete when in-card button clicked', async () => {
    const { emitted } = render(CardCard, {
      props: { ...cardProps, showDelete: true },
      global: globalPlugins,
    })

    const btn = document.querySelector('[data-testid="debt-delete-btn"]') as HTMLElement
    expect(btn).toBeTruthy()
    await fireEvent.click(btn)
    expect(emitted().delete).toBeTruthy()
  })
})
