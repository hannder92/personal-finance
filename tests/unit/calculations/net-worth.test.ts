import { describe, expect, it } from 'vitest'
import { calcNetWorth } from '@/lib/calculations/net-worth'

describe('lib/calculations/net-worth', () => {
  it('TC-U-022 (AC-9.3): net worth = sum(assets.value) − sum(cards.balance)', () => {
    const result = calcNetWorth(
      [{ value: 10_000_000 }, { value: 5_000_000 }],
      [{ balance: 2_000_000 }]
    )
    expect(result).toBe(13_000_000)
  })

  it('TC-U-023 (AC-9.4): negative net worth returned as-is (not clamped)', () => {
    const result = calcNetWorth([{ value: 1_000_000 }], [{ balance: 5_000_000 }])
    expect(result).toBe(-4_000_000)
  })

  it('AC-9.3: empty assets and cards returns 0', () => {
    expect(calcNetWorth([], [])).toBe(0)
  })

  it('AC-9.3: only assets returns total of assets', () => {
    expect(calcNetWorth([{ value: 3_000_000 }], [])).toBe(3_000_000)
  })

  it('AC-9.3: only liabilities returns negative total', () => {
    expect(calcNetWorth([], [{ balance: 2_000_000 }])).toBe(-2_000_000)
  })
})
