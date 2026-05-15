import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import IncomeStreamRow from '@/components/income/IncomeStreamRow.vue'

describe('IncomeStreamRow (AC-3.1 TC-C-010)', () => {
  it('AC-3.1 TC-C-010: semiannual amount 6_000_000 shows ≈ 1.000.000 / mes', () => {
    render(IncomeStreamRow, {
      props: {
        label: 'Bono semestral',
        amount: 6_000_000,
        frequency: 'semiannual',
        currency: 'COP',
      },
    })

    // 6_000_000 / 6 months = 1_000_000 monthly
    expect(screen.getByText(/1\.000\.000.*mes/)).toBeTruthy()
  })

  it('AC-3.1 TC-C-010: monthly stream shows its own amount as monthly equivalent', () => {
    render(IncomeStreamRow, {
      props: {
        label: 'Renta',
        amount: 800_000,
        frequency: 'monthly',
        currency: 'COP',
      },
    })
    expect(screen.getByText(/800\.000.*mes/)).toBeTruthy()
  })

  it('AC-3.1 TC-C-010: annual amount 12_000_000 shows 1.000.000 / mes', () => {
    render(IncomeStreamRow, {
      props: {
        label: 'Aguinaldo',
        amount: 12_000_000,
        frequency: 'annual',
        currency: 'COP',
      },
    })
    expect(screen.getByText(/1\.000\.000.*mes/)).toBeTruthy()
  })
})
