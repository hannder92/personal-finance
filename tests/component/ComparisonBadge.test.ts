import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import ComparisonBadge from '@/components/dashboard/ComparisonBadge.vue'

describe('ComparisonBadge (AC-11.3 AC-13.3 TC-C-028)', () => {
  it('AC-11.3 TC-C-028: shows "+10" with up indicator when current=70, previous=60', () => {
    render(ComparisonBadge, { props: { current: 70, previous: 60, label: 'score' } })

    expect(screen.getByText(/\+10/)).toBeTruthy()
    const badge = document.querySelector('[data-direction]') as HTMLElement
    expect(badge.getAttribute('data-direction')).toBe('up')
  })

  it('AC-13.3 TC-C-028: shows "-5" with down indicator when current=55, previous=60', () => {
    render(ComparisonBadge, { props: { current: 55, previous: 60, label: 'score' } })

    expect(screen.getByText(/-5/)).toBeTruthy()
    const badge = document.querySelector('[data-direction]') as HTMLElement
    expect(badge.getAttribute('data-direction')).toBe('down')
  })

  it('AC-11.3 TC-C-028: renders nothing when previous is null (single snapshot)', () => {
    render(ComparisonBadge, { props: { current: 70, previous: null, label: 'score' } })
    const badge = document.querySelector('[data-direction]')
    expect(badge).toBeNull()
  })
})
