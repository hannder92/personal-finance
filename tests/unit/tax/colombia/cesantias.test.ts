import { describe, expect, it } from 'vitest'
import { CESANTIAS_INTEREST_RATE, calcInteresesCesantias } from '@/lib/tax/colombia/cesantias'

describe('lib/tax/colombia/cesantias', () => {
  it('uses the 12% annual rate of Ley 52/1975', () => {
    expect(CESANTIAS_INTEREST_RATE).toBe(0.12)
  })

  it('estimates the interest on one year of cesantías (one monthly salary)', () => {
    expect(calcInteresesCesantias(10_000_000)).toBe(1_200_000)
  })

  it('returns 0 for missing or invalid salaries', () => {
    expect(calcInteresesCesantias(0)).toBe(0)
    expect(calcInteresesCesantias(-1)).toBe(0)
    expect(calcInteresesCesantias(Number.NaN)).toBe(0)
  })
})
