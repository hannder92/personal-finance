import { describe, expect, it } from 'vitest'
import { calcHousingRatio } from '@/lib/calculations/housing-ratio'

describe('lib/calculations/housing-ratio', () => {
  it('TC-U-008 (AC-4.3): housing expense divided by income returns percentage', () => {
    expect(
      calcHousingRatio(
        [
          { category: 'housing', amount: 1_200_000 },
          { category: 'food', amount: 500_000 },
        ],
        4_000_000
      )
    ).toBe(30)
  })

  it('TC-U-058 (AC-4.3): returns 0 when no housing-category expense exists', () => {
    expect(
      calcHousingRatio(
        [
          { category: 'food', amount: 500_000 },
          { category: 'transport', amount: 200_000 },
        ],
        4_000_000
      )
    ).toBe(0)
  })

  it('AC-4.3: sums all housing-category expenses (multiple housing entries)', () => {
    // arriendo 1M + servicios públicos categorized as housing 200K = 1.2M / 4M = 30%
    expect(
      calcHousingRatio(
        [
          { category: 'housing', amount: 1_000_000 },
          { category: 'housing', amount: 200_000 },
        ],
        4_000_000
      )
    ).toBe(30)
  })

  it('AC-4.3: returns 0 when totalIncome is 0 (no divide-by-zero)', () => {
    const result = calcHousingRatio([{ category: 'housing', amount: 500_000 }], 0)
    expect(result).toBe(0)
    expect(Number.isFinite(result)).toBe(true)
  })
})
