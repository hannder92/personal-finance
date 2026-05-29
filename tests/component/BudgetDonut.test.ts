import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import BudgetDonut from '@/components/dashboard/BudgetDonut.vue'

describe('BudgetDonut (AC-10.2 TC-C-031)', () => {
  it('renders a <canvas> for the donut', () => {
    render(BudgetDonut, { props: { needs: 50, wants: 30, savings: 20 } })
    const canvas = document.querySelector('canvas')
    expect(canvas).toBeTruthy()
  })

  it('TC-C-031: shows insight text when provided', () => {
    render(BudgetDonut, {
      props: { needs: 50, wants: 30, savings: 20, insight: 'Destinas $2M a ahorros (20%).' },
    })
    expect(screen.getByTestId('donut-insight').textContent).toContain('2M')
  })

  it('TC-C-042 (AC-1.5): insight text is separate from cash-flow projection copy', () => {
    render(BudgetDonut, {
      props: {
        needs: 50,
        wants: 30,
        savings: 20,
        insight: 'Destinas $2.000.000 a ahorros (20%).',
      },
    })
    const text = screen.getByTestId('donut-insight').textContent ?? ''
    expect(text).toMatch(/ahorros/i)
    expect(text).not.toMatch(/flujo de caja acumulado/i)
  })

  it('TC-C-031: shows empty message instead of chart', () => {
    render(BudgetDonut, { props: { emptyMessage: 'Sin datos' } })
    expect(screen.getByTestId('donut-empty').textContent).toBe('Sin datos')
    expect(document.querySelector('canvas')).toBeNull()
  })
})
