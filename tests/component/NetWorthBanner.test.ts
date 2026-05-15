import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import NetWorthBanner from '@/components/networth/NetWorthBanner.vue'

describe('NetWorthBanner (AC-9.2 AC-9.3 TC-C-023)', () => {
  it('AC-9.3 TC-C-023: positive net worth → green color state', () => {
    render(NetWorthBanner, {
      props: { totalAssets: 10_000_000, totalLiabilities: 3_000_000, currency: 'COP' },
    })
    const banner = document.querySelector('[data-color-state]') as HTMLElement
    expect(banner.getAttribute('data-color-state')).toBe('positive')
    expect(screen.getByText(/7\.000\.000/)).toBeTruthy()
  })

  it('AC-9.3 TC-C-023: negative net worth → red color state', () => {
    render(NetWorthBanner, {
      props: { totalAssets: 1_000_000, totalLiabilities: 3_000_000, currency: 'COP' },
    })
    const banner = document.querySelector('[data-color-state]') as HTMLElement
    expect(banner.getAttribute('data-color-state')).toBe('negative')
    const text = document.body.textContent ?? ''
    expect(text.match(/-?\s*2\.000\.000/)).toBeTruthy()
  })

  it('AC-9.2 TC-C-023: liabilities section shows passed value (no manual entry)', () => {
    render(NetWorthBanner, {
      props: { totalAssets: 5_000_000, totalLiabilities: 3_000_000, currency: 'COP' },
    })
    expect(screen.getByText(/Pasivos/)).toBeTruthy()
    expect(screen.getByText(/3\.000\.000/)).toBeTruthy()
  })
})
