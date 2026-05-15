import { fireEvent, render, screen } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import CurrencyInput from '@/components/common/CurrencyInput.vue'

describe('CurrencyInput (AC-17.8)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  afterEach(() => {
    localStorage.clear()
  })

  it('AC-17.8: renders initial modelValue as formatted currency', () => {
    render(CurrencyInput, {
      props: { modelValue: 50000, currency: 'COP', placeholder: 'Monto' },
    })

    const input = screen.getByRole('textbox') as HTMLInputElement
    // On render the input should show the formatted value (display mode).
    expect(input.value).toMatch(/50\.000/)
  })

  it('AC-17.8: formats numeric modelValue with currency on blur (COP, 0 decimals)', async () => {
    render(CurrencyInput, {
      props: { modelValue: 1234567, currency: 'COP' },
    })

    const input = screen.getByRole('textbox') as HTMLInputElement
    await fireEvent.blur(input)

    expect(input.value).toMatch(/1\.234\.567/)
    expect(input.value).toContain('$')
  })

  it('AC-17.8: emits update:modelValue with parsed number on user input', async () => {
    const { emitted } = render(CurrencyInput, {
      props: { modelValue: 0, currency: 'COP' },
    })

    const input = screen.getByRole('textbox') as HTMLInputElement
    await fireEvent.update(input, '1234567')

    const events = emitted('update:modelValue') as unknown[][] | undefined
    expect(events).toBeTruthy()
    expect(events?.[events.length - 1]?.[0]).toBe(1234567)
  })

  it('AC-17.8: strips non-numeric characters when parsing user input', async () => {
    const { emitted } = render(CurrencyInput, {
      props: { modelValue: 0, currency: 'COP' },
    })

    const input = screen.getByRole('textbox') as HTMLInputElement
    await fireEvent.update(input, '$ 1.234.567')

    const events = emitted('update:modelValue') as unknown[][] | undefined
    expect(events?.[events.length - 1]?.[0]).toBe(1234567)
  })
})
