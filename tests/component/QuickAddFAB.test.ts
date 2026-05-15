import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import QuickAddFAB from '@/components/variable/QuickAddFAB.vue'

describe('QuickAddFAB (AC-8.3 TC-C-021)', () => {
  it('AC-8.3 TC-C-021: renders when route="/" (dashboard)', () => {
    render(QuickAddFAB, { props: { route: '/' } })
    expect(screen.queryByRole('button', { name: /agregar|registrar/i })).toBeTruthy()
  })

  it('AC-8.3 TC-C-021: does NOT render when route="/debts"', () => {
    render(QuickAddFAB, { props: { route: '/debts' } })
    expect(screen.queryByRole('button', { name: /agregar|registrar/i })).toBeNull()
  })

  it('AC-8.3 TC-C-021: clicking opens panel with category selector + amount input', async () => {
    render(QuickAddFAB, { props: { route: '/' } })

    const fab = screen.getByRole('button', { name: /agregar|registrar/i })
    await fireEvent.click(fab)

    expect(screen.getByRole('combobox')).toBeTruthy()
    const amountInput = screen.getByRole('textbox', { name: /monto|amount/i })
    expect(amountInput).toBeTruthy()
  })
})
