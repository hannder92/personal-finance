import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import ProjectionChart from '@/components/dashboard/ProjectionChart.vue'

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
