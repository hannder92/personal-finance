import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import InstallmentList from '@/components/debts/InstallmentList.vue'

describe('InstallmentList (AC-6.3 TC-C-017)', () => {
  it('AC-6.3 TC-C-017: shows "4 / 12" paid/total progress text', () => {
    render(InstallmentList, {
      props: {
        items: [{ id: 'i1', name: 'TV', total: 1_200_000, installments: 12, paid: 4 }],
        currency: 'COP',
      },
    })
    expect(screen.getByText(/4\s*\/\s*12/)).toBeTruthy()
  })

  it('AC-6.3 TC-C-017: lists each installment by name', () => {
    render(InstallmentList, {
      props: {
        items: [
          { id: 'i1', name: 'TV', total: 1_200_000, installments: 12, paid: 4 },
          { id: 'i2', name: 'Lavadora', total: 800_000, installments: 8, paid: 1 },
        ],
        currency: 'COP',
      },
    })
    expect(screen.getByText('TV')).toBeTruthy()
    expect(screen.getByText('Lavadora')).toBeTruthy()
  })
})
