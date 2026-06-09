// T-011 — Covers: AC-3.1–3.4 · TC-U-008, TC-I-006, TC-I-007
import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import NetWorthCards from '@/components/dashboard/NetWorthCards.vue'
import { i18n } from '@/i18n'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: { template: '<div />' } },
    { path: '/networth', name: 'networth', component: { template: '<div />' } },
    { path: '/debts', name: 'debts', component: { template: '<div />' } },
  ],
})

function mountCards(opts: { assets?: number; debts?: number } = {}) {
  const { assets = 0, debts = 0 } = opts
  return render(NetWorthCards, {
    global: {
      plugins: [
        i18n,
        router,
        createTestingPinia({
          createSpy: vi.fn,
          stubActions: false,
          initialState: {
            settings: {
              state: { lang: 'es', currency: 'COP', theme: 'system', payoffMethod: 'avalanche' },
            },
            assets: {
              state: {
                items: assets
                  ? [
                      {
                        id: 'a1',
                        name: 'Ahorros',
                        value: assets,
                        type: 'savings',
                        annualRatePercent: 0,
                      },
                    ]
                  : [],
              },
            },
            cards: {
              state: {
                items: debts
                  ? [
                      {
                        id: 'c1',
                        name: 'Visa',
                        type: 'card',
                        balance: debts,
                        limit: debts * 2,
                        apr: 30,
                        minPayment: 100_000,
                        dueDate: null,
                        installments: [],
                      },
                    ]
                  : [],
              },
            },
          },
        }),
      ],
    },
  })
}

describe('NetWorthCards (TC-U-008, TC-I-006, TC-I-007)', () => {
  it('TC-I-006 (AC-3.1): renders exactly three cards with hero amounts', () => {
    mountCards({ assets: 5_000_000, debts: 2_000_000 })
    const have = screen.getByTestId('networth-have')
    const owe = screen.getByTestId('networth-owe')
    const net = screen.getByTestId('networth-net')
    expect(have.textContent).toContain('Tengo')
    expect(owe.textContent).toContain('Debo')
    expect(net.textContent).toContain('Neto')
    expect(have.textContent).toMatch(/5[.,]000[.,]000/)
    expect(owe.textContent).toMatch(/2[.,]000[.,]000/)
    expect(net.textContent).toMatch(/3[.,]000[.,]000/)
    // Amount is the largest type in each card (hero typography)
    const amount = screen.getByTestId('networth-have-amount')
    expect(amount.className).toMatch(/text-xl|text-2xl|text-3xl/)
    // Exactly three cards, never one per asset
    expect(screen.queryAllByTestId(/^networth-(have|owe|net)$/)).toHaveLength(3)
  })

  it('TC-I-006 (AC-3.2): cards link to detail views', () => {
    mountCards({ assets: 1, debts: 1 })
    expect(screen.getByTestId('networth-have').closest('a')?.getAttribute('href')).toBe('/networth')
    expect(screen.getByTestId('networth-owe').closest('a')?.getAttribute('href')).toBe('/debts')
    expect(screen.getByTestId('networth-net').closest('a')?.getAttribute('href')).toBe('/networth')
  })

  it('TC-U-008 (AC-3.3): negative net is red with minus sign, positive is green', () => {
    mountCards({ assets: 1_000_000, debts: 3_000_000 })
    const amount = screen.getByTestId('networth-net-amount')
    expect(amount.className).toMatch(/red/)
    expect(amount.textContent).toMatch(/-|−/)
  })

  it('TC-U-008 (AC-3.3): non-negative net uses green semantics', () => {
    mountCards({ assets: 3_000_000, debts: 1_000_000 })
    expect(screen.getByTestId('networth-net-amount').className).toMatch(/emerald|green/)
  })

  it('TC-I-007 (AC-3.4): empty state with icon and copy instead of $0 cards', () => {
    mountCards()
    expect(screen.queryByTestId('networth-have')).toBeNull()
    const empty = screen.getByTestId('networth-empty')
    expect(empty.textContent).toContain('Registra tus activos o deudas')
    expect(empty.querySelector('svg')).toBeTruthy()
  })
})
