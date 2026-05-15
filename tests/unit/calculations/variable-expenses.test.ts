import { describe, expect, it } from 'vitest'
import { calcSpendingStatus } from '@/lib/calculations/variable-expenses'

describe('lib/calculations/variable-expenses', () => {
  it('TC-U-051 (AC-8.1): under 80% spent → green', () => {
    expect(calcSpendingStatus({ budget: 500_000, spent: 300_000 })).toBe('green')
  })

  it('TC-U-051 (AC-8.1): at 80% spent → amber', () => {
    expect(calcSpendingStatus({ budget: 500_000, spent: 400_000 })).toBe('amber')
  })

  it('TC-U-051 (AC-8.1): just under 100% spent → amber', () => {
    expect(calcSpendingStatus({ budget: 500_000, spent: 499_000 })).toBe('amber')
  })

  it('TC-U-051 (AC-8.1): at 100% spent → red', () => {
    expect(calcSpendingStatus({ budget: 500_000, spent: 500_000 })).toBe('red')
  })

  it('TC-U-051 (AC-8.1): over budget → red', () => {
    expect(calcSpendingStatus({ budget: 500_000, spent: 600_000 })).toBe('red')
  })

  it('AC-8.1: zero spent → green', () => {
    expect(calcSpendingStatus({ budget: 500_000, spent: 0 })).toBe('green')
  })

  it('AC-8.1: zero budget with any spend → red (defensive)', () => {
    expect(calcSpendingStatus({ budget: 0, spent: 100 })).toBe('red')
  })
})
