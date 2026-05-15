import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import DeductionRow from '@/components/income/DeductionRow.vue'

describe('DeductionRow (AC-2.1 TC-C-006)', () => {
  it('AC-2.1 TC-C-006: percent deduction shows monthly equivalent amount in currency', () => {
    render(DeductionRow, {
      props: {
        label: 'Salud',
        amount: 4,
        type: 'percent',
        grossSalary: 5_000_000,
        currency: 'COP',
      },
    })

    // 4% × 5_000_000 = 200_000 → "$200.000" in es-CO
    expect(screen.getByText(/\$\s*200\.000/)).toBeTruthy()
  })

  it('AC-2.1 TC-C-006: fixed deduction shows its amount with currency, no recomputation', () => {
    render(DeductionRow, {
      props: {
        label: 'Préstamo',
        amount: 150_000,
        type: 'fixed',
        grossSalary: 5_000_000,
        currency: 'COP',
      },
    })
    expect(screen.getByText(/\$\s*150\.000/)).toBeTruthy()
  })

  it('AC-2.1 TC-C-006: percent deduction shows the percent suffix', () => {
    render(DeductionRow, {
      props: {
        label: 'Pensión',
        amount: 4,
        type: 'percent',
        grossSalary: 5_000_000,
        currency: 'COP',
      },
    })
    expect(screen.getByText(/4\s*%/)).toBeTruthy()
  })
})
