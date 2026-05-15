import { render, screen } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AppToast from '@/components/common/AppToast.vue'

describe('AppToast (AC-17.8)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('AC-17.8: renders message when shown', () => {
    render(AppToast, {
      props: { message: 'Guardado correctamente', timeout: 3000 },
    })

    expect(screen.getByText('Guardado correctamente')).toBeTruthy()
  })

  it('AC-17.8: auto-dismisses after timeout (emits dismiss)', async () => {
    const { emitted } = render(AppToast, {
      props: { message: 'Hi', timeout: 1500 },
    })

    expect(emitted('dismiss')).toBeUndefined()
    vi.advanceTimersByTime(1500)
    await Promise.resolve()
    expect(emitted('dismiss')).toBeTruthy()
  })

  it('AC-17.8: applies variant class for warning', () => {
    render(AppToast, {
      props: { message: 'Atención', timeout: 1000, variant: 'warning' },
    })

    const root = screen.getByText('Atención').closest('[data-variant]')
    expect(root?.getAttribute('data-variant')).toBe('warning')
  })
})
