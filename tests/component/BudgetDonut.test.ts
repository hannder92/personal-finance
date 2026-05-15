import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import BudgetDonut from '@/components/dashboard/BudgetDonut.vue'

describe('BudgetDonut (AC-10.2 TC-C-024)', () => {
  it('AC-10.2 TC-C-024: renders a <canvas> for the donut', () => {
    render(BudgetDonut, { props: { needs: 50, wants: 30, savings: 20 } })
    const canvas = document.querySelector('canvas')
    expect(canvas).toBeTruthy()
  })
})
