/**
 * Planificación integrada — extend in T-020: TC-C-044 (AC-2.3) flow insight copy.
 */
import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import ProjectionChart from '@/components/dashboard/ProjectionChart.vue'

describe('ProjectionChart — planificación integrada (TC-C-044)', () => {
  it('TC-C-044 (AC-2.3): renders flow insight distinct from donut savings copy', () => {
    const { getByTestId } = render(ProjectionChart, {
      props: {
        months: Array.from({ length: 12 }, (_, i) => ({
          label: `M${i + 1}`,
          balance: (i + 1) * 1_000_000,
        })),
        insight: 'Tu flujo de caja acumulado llegaría a $12.000.000 en 12 meses.',
      },
    })
    const text = getByTestId('projection-insight').textContent ?? ''
    expect(text).toMatch(/flujo de caja/i)
    expect(text).not.toMatch(/Destinas/i)
  })
})

describe('ProjectionChart (AC-12.4 TC-C-024)', () => {
  it('AC-12.4 TC-C-024: renders a <canvas> for the projection', () => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      label: `M${i + 1}`,
      balance: 1_000_000 + i * 100_000,
    }))
    render(ProjectionChart, { props: { months } })
    const canvas = document.querySelector('canvas')
    expect(canvas).toBeTruthy()
  })
})
