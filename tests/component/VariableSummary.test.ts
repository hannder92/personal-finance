import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import VariableSummary from '@/components/variable/VariableSummary.vue'

describe('VariableSummary (AC-8.5 TC-C-022)', () => {
  it('AC-8.5 TC-C-022: shows excess in red when totalSpent > totalBudget', () => {
    render(VariableSummary, {
      props: { totalBudget: 1_000_000, totalSpent: 1_200_000, currency: 'COP' },
    })
    // Excess shown explicitly as "Exceso: $200.000" (label disambiguates from totals).
    const excessNode = screen.getByText(/Exceso:.*200\.000/)
    expect(excessNode).toBeTruthy()
    const container = excessNode.closest('[data-state]') as HTMLElement
    expect(container.getAttribute('data-state')).toBe('over')
  })

  it('AC-8.5 TC-C-022: no excess indicator when spent ≤ budget', () => {
    render(VariableSummary, {
      props: { totalBudget: 1_000_000, totalSpent: 800_000, currency: 'COP' },
    })
    const container = document.querySelector('[data-state]') as HTMLElement | null
    expect(container?.getAttribute('data-state')).not.toBe('over')
  })
})
