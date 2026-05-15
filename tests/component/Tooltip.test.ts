import { fireEvent, render, screen } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Tooltip from '@/components/common/Tooltip.vue'

describe('Tooltip (AC-17.10 TC-C-034)', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 })
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 })
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('AC-17.10 TC-C-034: renders trigger slot content always', () => {
    render(Tooltip, {
      props: { content: 'Detalle' },
      slots: { default: '<button>Trigger</button>' },
    })
    expect(screen.getByText('Trigger')).toBeTruthy()
  })

  it('AC-17.10 TC-C-034: opens tooltip role on trigger hover/focus', async () => {
    render(Tooltip, {
      props: { content: 'Detalle' },
      slots: { default: '<button>Trigger</button>' },
    })
    expect(screen.queryByRole('tooltip')).toBeNull()

    const trigger = screen.getByText('Trigger')
    await fireEvent.focusIn(trigger)

    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip.textContent).toContain('Detalle')
  })

  it('AC-17.10 TC-C-034: tooltip stays inside viewport when trigger near right edge (375px viewport)', async () => {
    render(Tooltip, {
      props: { content: 'Detalle largo de tooltip', collisionPadding: 8 },
      slots: { default: '<button>Trigger</button>' },
    })

    const trigger = screen.getByText('Trigger') as HTMLElement
    // Place trigger near the right edge.
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      x: 350,
      y: 100,
      top: 100,
      left: 350,
      right: 365,
      bottom: 120,
      width: 15,
      height: 20,
      toJSON: () => ({}),
    } as DOMRect)

    await fireEvent.focusIn(trigger)
    const tooltip = await screen.findByRole('tooltip')

    // Simulate measured tooltip size of 150px wide.
    vi.spyOn(tooltip, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 150,
      bottom: 30,
      width: 150,
      height: 30,
      toJSON: () => ({}),
    } as DOMRect)

    // Trigger position recalculation (component should reposition reactively).
    await fireEvent.scroll(window)

    const collisionAdjusted = tooltip.getAttribute('data-collision-adjusted')
    expect(collisionAdjusted).toBe('true')
  })
})
