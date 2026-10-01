// T-012 — Covers: AC-4.1–4.3 · TC-I-008, TC-I-009
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import CashFlowChart from '@/components/dashboard/CashFlowChart.vue'
import { i18n } from '@/i18n'

const POINTS = [
  { month: '2026-01', income: 4_000_000, expenses: 2_500_000 },
  { month: '2026-02', income: 4_000_000, expenses: 3_100_000 },
  { month: '2026-03', income: 4_200_000, expenses: 2_800_000 },
]

function mountChart(points = POINTS) {
  return render(CashFlowChart, {
    props: { points },
    global: { plugins: [i18n] },
  })
}

describe('CashFlowChart (TC-I-008, TC-I-009)', () => {
  it('TC-I-008 (AC-4.1): renders a bar chart with one pair per closed month', () => {
    mountChart()
    const wrapper = screen.getByTestId('cashflow-chart')
    expect(wrapper.getAttribute('data-months')).toBe('3')
    expect(document.querySelector('[data-chart-stub="bar"]')).toBeTruthy()
  })

  it('TC-I-008 (AC-4.2): visible legend with semantic colors (green income / red expenses)', () => {
    mountChart()
    const legend = screen.getByTestId('cashflow-legend')
    expect(legend.textContent).toContain('Ingresos')
    expect(legend.textContent).toContain('Gastos')
    expect(legend.innerHTML).toMatch(/emerald|green/)
    expect(legend.innerHTML).toMatch(/red|rose/)
  })

  it('TC-I-009 (AC-4.3): fewer than 2 months renders the explanatory empty state, no canvas', () => {
    mountChart([POINTS[0]!])
    expect(screen.getByTestId('cashflow-empty').textContent).toContain(
      'se construye con el cierre de cada mes'
    )
    expect(document.querySelector('canvas')).toBeNull()
  })

  it('TC-I-009 (AC-4.3): zero months also renders empty state', () => {
    mountChart([])
    expect(screen.getByTestId('cashflow-empty')).toBeTruthy()
  })
})
