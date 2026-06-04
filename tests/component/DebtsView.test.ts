import { fireEvent, render, screen, within } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import DebtsView from '@/views/DebtsView.vue'
import { i18n } from '@/i18n'

const cardA = {
  id: '11111111-1111-4111-8111-111111111111',
  type: 'card' as const,
  name: 'Visa',
  balance: 1_000_000,
  limit: 5_000_000,
  apr: 24,
  minPayment: 100_000,
  dueDate: null,
  installments: [],
}

const cardB = {
  id: '22222222-2222-4222-8222-222222222222',
  type: 'card' as const,
  name: 'Mastercard',
  balance: 500_000,
  limit: 3_000_000,
  apr: 22,
  minPayment: 50_000,
  dueDate: null,
  installments: [],
}

function mountDebts() {
  return render(DebtsView, {
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
            cards: { state: { items: [cardA, cardB] } },
          },
        }),
      ],
    },
  })
}

describe('DebtsView (20260529-metricas-runway-ingresos delete-in-card)', () => {
  it('TC-C-065 (AC-5.2): delete control lives inside card, not as external sibling button', () => {
    const { container } = mountDebts()

    const deleteButtons = container.querySelectorAll('[data-testid="debt-delete-btn"]')
    expect(deleteButtons.length).toBe(2)
    deleteButtons.forEach((btn) => {
      expect(btn.closest('article')).toBeTruthy()
    })
    expect(screen.queryByRole('button', { name: /^eliminar deuda$/i })).toBeNull()
  })

  it('TC-C-066 (AC-5.3): cancel confirm keeps debt count unchanged', async () => {
    mountDebts()

    const deleteButtons = document.querySelectorAll('[data-testid="debt-delete-btn"]')
    await fireEvent.click(deleteButtons[0] as HTMLElement)

    const dialog = screen.getByRole('dialog')
    await fireEvent.click(within(dialog).getByRole('button', { name: /cancelar|cancel/i }))

    expect(document.querySelectorAll('[data-testid="debt-delete-btn"]').length).toBe(2)
  })

  it('TC-C-066 (AC-5.3): confirm delete removes one debt', async () => {
    mountDebts()

    const deleteButtons = document.querySelectorAll('[data-testid="debt-delete-btn"]')
    await fireEvent.click(deleteButtons[0] as HTMLElement)

    const dialog = screen.getByRole('dialog')
    await fireEvent.click(within(dialog).getByRole('button', { name: /confirmar|confirm/i }))

    expect(document.querySelectorAll('[data-testid="debt-delete-btn"]').length).toBe(1)
  })
})
