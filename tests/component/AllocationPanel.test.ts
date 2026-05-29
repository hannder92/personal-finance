/**
 * Planificación integrada — extend in T-018: TC-C-041 (AC-1.4) net income amounts.
 */
import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import AllocationPanel from '@/components/allocation/AllocationPanel.vue'
import { useAllocationStore } from '@/stores/allocationStore'

function mount(initial: Record<string, unknown> = {}) {
  return render(AllocationPanel, {
    props: { totalIncome: 5_000_000, currency: 'COP' },
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
            allocation: { state: { needs: 50, wants: 30, savings: 20 } },
            ...initial,
          },
        }),
      ],
    },
  })
}

describe('AllocationPanel — planificación integrada (TC-C-041)', () => {
  it('TC-C-041 (AC-1.4): needs amount uses net income, not gross (via AllocationView)', async () => {
    const { default: AllocationView } = await import('@/views/AllocationView.vue')
    render(AllocationView, {
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
              income: {
                state: {
                  grossSalary: 12_100_000,
                  deductions: [
                    { id: 'd1', label: 'Salud', amount: 4, type: 'percent' },
                    { id: 'd2', label: 'Pensión', amount: 4, type: 'percent' },
                  ],
                  otherStreams: [],
                  nonSalaryBenefits: [],
                },
              },
              allocation: { state: { needs: 50, wants: 30, savings: 20 } },
            },
          }),
        ],
      },
    })
    const netNeeds = Math.round(11_132_000 * 0.5)
    const grossNeeds = Math.round(12_100_000 * 0.5)
    expect(document.body.textContent).toContain(
      netNeeds.toLocaleString('es-CO').replace(/\u00a0/g, ' ')
    )
    expect(document.body.textContent).not.toContain(
      grossNeeds.toLocaleString('es-CO').replace(/\u00a0/g, ' ')
    )
  })
})

describe('AllocationPanel (AC-14.1 AC-14.2 TC-C-026)', () => {
  it('AC-14.1 TC-C-026: changing needs to 60 → savings auto-updates to 10', async () => {
    mount()
    const store = useAllocationStore()
    const spy = vi.spyOn(store, 'setAllocation')

    const needs = screen.getByRole('spinbutton', { name: /necesidades|needs/i }) as HTMLInputElement
    await fireEvent.update(needs, '60')

    // setAllocation was called with (60, 30) which yields savings 10
    expect(spy).toHaveBeenCalledWith(60, 30)
    expect(store.state.savings).toBe(10)
  })

  it('AC-14.1 TC-C-026: savings field is read-only / auto-derived', () => {
    mount()
    const savingsField = screen
      .getByText(/savings|ahorros/i)
      .closest('label')
      ?.querySelector('input') as HTMLInputElement | null
    if (savingsField) {
      expect(savingsField.readOnly || savingsField.disabled).toBe(true)
    } else {
      // Or savings shown as plain text (not input)
      const text = document.body.textContent ?? ''
      expect(text.match(/20\s*%/)).toBeTruthy()
    }
  })

  it('AC-14.2 TC-C-026: needs=60 + wants=50 → conflict flagged with data-invalid, store NOT updated', async () => {
    mount()
    const store = useAllocationStore()
    const spy = vi.spyOn(store, 'setAllocation')

    const needs = screen.getByRole('spinbutton', { name: /necesidades|needs/i }) as HTMLInputElement
    const wants = screen.getByRole('spinbutton', { name: /deseos|wants/i }) as HTMLInputElement

    await fireEvent.update(needs, '60')
    await fireEvent.update(wants, '50')

    // Last call would have been (60, 50) — over 100. setAllocation should refuse OR not be called.
    const lastCall = spy.mock.calls[spy.mock.calls.length - 1]
    if (lastCall) expect(lastCall[0] + lastCall[1]).toBeLessThanOrEqual(100)

    // State should still satisfy invariant.
    expect(store.state.needs + store.state.wants + store.state.savings).toBe(100)

    // One of the fields carries an error indicator.
    const invalid = document.querySelector('[data-invalid="true"]')
    expect(invalid).toBeTruthy()
  })
})
