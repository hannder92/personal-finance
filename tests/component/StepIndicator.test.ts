import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import StepIndicator from '@/components/onboarding/StepIndicator.vue'

describe('StepIndicator (AC-1.2 TC-C-001)', () => {
  it('AC-1.2 TC-C-001: renders "current/total" label', () => {
    render(StepIndicator, { props: { current: 1, total: 3 } })
    expect(screen.getByText(/1\s*\/\s*3/)).toBeTruthy()
  })

  it('AC-1.2 TC-C-001: renders a progress bar reflecting completion fraction', () => {
    render(StepIndicator, { props: { current: 2, total: 3 } })
    const bar = document.querySelector('[role="progressbar"]') as HTMLElement
    expect(bar).toBeTruthy()
    expect(bar.getAttribute('aria-valuenow')).toBe('2')
    expect(bar.getAttribute('aria-valuemax')).toBe('3')
  })

  it('AC-1.2 TC-C-001: progress bar width corresponds to current/total', () => {
    render(StepIndicator, { props: { current: 1, total: 3 } })
    const inner = document.querySelector('[data-progress-inner]') as HTMLElement
    expect(inner).toBeTruthy()
    expect(inner.style.width).toMatch(/33(\.|%)/)
  })
})
