import { describe, expect, it } from 'vitest'
import { calcIncomeMixByClass } from '@/lib/calculations/income-mix'

describe('lib/calculations/income-mix', () => {
  it('TC-U-003 (AC-3.1, AC-3.3): salary is linear; streams split by class with semiannual equivalent', () => {
    const result = calcIncomeMixByClass({
      salaryNetMonthly: 8_000_000,
      streams: [
        { amount: 1_000_000, frequency: 'monthly', incomeClass: 'passive' },
        { amount: 3_000_000, frequency: 'semiannual', incomeClass: 'residual' },
      ],
    })
    expect(result.linear).toBe(8_000_000)
    expect(result.passive).toBe(1_000_000)
    expect(result.residual).toBe(500_000)
  })

  it('TC-U-003 (AC-3.1): salary-only yields full amount in linear bucket', () => {
    const result = calcIncomeMixByClass({
      salaryNetMonthly: 5_000_000,
      streams: [],
    })
    expect(result.linear).toBe(5_000_000)
    expect(result.passive).toBe(0)
    expect(result.residual).toBe(0)
  })
})
