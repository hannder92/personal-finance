import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import LanguageToggle from '@/components/common/LanguageToggle.vue'

describe('LanguageToggle (AC-16.4)', () => {
  it('AC-16.4: clicking when locale=es emits update:modelValue=en', async () => {
    const { emitted } = render(LanguageToggle, { props: { modelValue: 'es' } })

    await fireEvent.click(screen.getByRole('button'))

    const events = emitted('update:modelValue') as unknown[][] | undefined
    expect(events?.[0]?.[0]).toBe('en')
  })

  it('AC-16.4: clicking when locale=en emits update:modelValue=es', async () => {
    const { emitted } = render(LanguageToggle, { props: { modelValue: 'en' } })

    await fireEvent.click(screen.getByRole('button'))

    const events = emitted('update:modelValue') as unknown[][] | undefined
    expect(events?.[0]?.[0]).toBe('es')
  })

  it('AC-16.4: shows the current locale label', () => {
    render(LanguageToggle, { props: { modelValue: 'es' } })
    const btn = screen.getByRole('button')
    expect(btn.textContent?.toUpperCase()).toContain('ES')
  })

  it('AC-16.4: button has accessible label/aria-label', () => {
    render(LanguageToggle, { props: { modelValue: 'es' } })
    const btn = screen.getByRole('button')
    const label = btn.getAttribute('aria-label') ?? btn.textContent ?? ''
    expect(label.length).toBeGreaterThan(0)
  })
})
