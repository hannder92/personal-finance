import { fireEvent, render, screen } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import { i18n } from '@/i18n'

describe('ThemeToggle (AC-16.3 AC-17.2 TC-C-033)', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
  })
  afterEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it('AC-16.3 TC-C-033: clicking from light emits update with new value', async () => {
    const { emitted } = render(ThemeToggle, {
      props: { modelValue: 'light' },
      global: { plugins: [i18n] },
    })

    const btn = screen.getByRole('button')
    await fireEvent.click(btn)

    const events = emitted('update:modelValue') as unknown[][] | undefined
    expect(events).toBeTruthy()
    expect(['system', 'light', 'dark']).toContain(events?.[0]?.[0])
    expect(events?.[0]?.[0]).not.toBe('light')
  })

  it('AC-16.3 TC-C-033: cycles through system → light → dark → system', async () => {
    const sequence: Array<'system' | 'light' | 'dark'> = []
    const { emitted, rerender } = render(ThemeToggle, {
      props: { modelValue: 'system' },
      global: { plugins: [i18n] },
    })

    for (let i = 0; i < 3; i++) {
      await fireEvent.click(screen.getByRole('button'))
      const events = emitted('update:modelValue') as unknown[][]
      const last = events[events.length - 1]?.[0] as 'system' | 'light' | 'dark'
      sequence.push(last)
      await rerender({ modelValue: last })
    }

    expect(sequence).toEqual(['light', 'dark', 'system'])
  })

  it('AC-17.2 TC-C-033: applies "dark" class to <html> when modelValue=dark', async () => {
    const { rerender } = render(ThemeToggle, {
      props: { modelValue: 'light' },
      global: { plugins: [i18n] },
    })
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    await rerender({ modelValue: 'dark' })
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    await rerender({ modelValue: 'light' })
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('AC-17.7 TC-C-033: button exposes aria-label describing current theme', () => {
    render(ThemeToggle, {
      props: { modelValue: 'light' },
      global: { plugins: [i18n] },
    })
    const btn = screen.getByRole('button')
    const label = btn.getAttribute('aria-label') ?? ''
    expect(label.toLowerCase()).toMatch(/theme|tema|claro|light/)
  })
})
