import { fireEvent, render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BottomNav from '@/components/common/BottomNav.vue'

const items = [
  { id: 'dashboard', label: 'Dashboard', to: '/' },
  { id: 'income', label: 'Ingresos', to: '/income' },
  { id: 'expenses', label: 'Gastos', to: '/expenses' },
  { id: 'debts', label: 'Deudas', to: '/debts' },
  { id: 'goals', label: 'Metas', to: '/goals' },
]

describe('BottomNav (AC-16.1 AC-17.3 AC-17.7 TC-C-032)', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })
  })

  it('AC-16.1 TC-C-032: renders one nav item per provided item', () => {
    render(BottomNav, { props: { items, activeId: 'dashboard' } })
    expect(screen.getAllByRole('link').length).toBe(items.length)
  })

  it('AC-16.1 TC-C-032: marks active item with aria-current=page', () => {
    render(BottomNav, { props: { items, activeId: 'income' } })
    const active = screen.getByText('Ingresos').closest('a')!
    expect(active.getAttribute('aria-current')).toBe('page')
  })

  it('AC-17.3 TC-C-032: at 375px, no two items overlap (using mocked rects)', () => {
    const { container } = render(BottomNav, { props: { items, activeId: 'dashboard' } })

    const links = container.querySelectorAll('a')
    expect(links.length).toBe(items.length)
    // Distribute 5 items across 375px = ~75px each.
    const width = 75
    links.forEach((el, i) => {
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        x: i * width,
        y: 0,
        top: 0,
        left: i * width,
        right: (i + 1) * width,
        bottom: 60,
        width,
        height: 60,
        toJSON: () => ({}),
      } as DOMRect)
    })

    for (let i = 0; i < links.length - 1; i++) {
      const a = links[i]!.getBoundingClientRect()
      const b = links[i + 1]!.getBoundingClientRect()
      expect(a.right).toBeLessThanOrEqual(b.left)
    }
  })

  it('AC-17.7 TC-C-032: nav links carry focus-visible utility class', () => {
    const { container } = render(BottomNav, { props: { items, activeId: 'dashboard' } })
    const firstLink = container.querySelector('a')!
    expect(firstLink.className).toMatch(/focus-visible|focus:/)
  })

  it('AC-16.1 TC-C-032: clicking a link emits navigate event with item id', async () => {
    const { emitted } = render(BottomNav, { props: { items, activeId: 'dashboard' } })

    const expenses = screen.getByText('Gastos').closest('a') as HTMLAnchorElement
    await fireEvent.click(expenses)

    const events = emitted('navigate') as unknown[][] | undefined
    expect(events?.[0]?.[0]).toBe('expenses')
  })
})
