import { describe, expect, it } from 'vitest'
import { calcNetSalary } from '@/lib/calculations/net-income'

describe('lib/calculations/net-income', () => {
  it('TC-U-001 (AC-2.5): one fixed deduction subtracted from gross', () => {
    expect(
      calcNetSalary({
        grossSalary: 4_000_000,
        deductions: [{ amount: 200_000, type: 'fixed' }],
      })
    ).toBe(3_800_000)
  })

  it('TC-U-002 (AC-2.1, AC-2.5): percent deduction computed on gross', () => {
    // 4% of 5M = 200K → net = 5M − 200K = 4.8M
    expect(
      calcNetSalary({
        grossSalary: 5_000_000,
        deductions: [{ amount: 4, type: 'percent' }],
      })
    ).toBe(4_800_000)
  })

  it('TC-U-003 (AC-2.4): non-salary benefit is added AFTER deductions (not part of deduction base)', () => {
    // gross 3M − fixed 120K = 2.88M; benefit 200K → net = 3.08M
    // Crucially, the benefit does NOT enter the percent-deduction base.
    expect(
      calcNetSalary({
        grossSalary: 3_000_000,
        deductions: [{ amount: 120_000, type: 'fixed' }],
        nonSalaryBenefits: [{ amount: 200_000 }],
      })
    ).toBe(3_080_000)
  })

  it('TC-U-004 (EC-1): grossSalary=0 with percent deduction is safe (no NaN, no Infinity)', () => {
    const result = calcNetSalary({
      grossSalary: 0,
      deductions: [{ amount: 4, type: 'percent' }],
    })
    expect(result).toBe(0)
    expect(Number.isFinite(result)).toBe(true)
  })

  it('AC-2.1: percent deduction uses gross only, NOT gross + benefits', () => {
    // If percent base wrongly included benefits, 4% × (5M + 1M) = 240K → net would be 5.76M.
    // Correct: 4% × 5M = 200K → net = 5M − 200K + 1M = 5.8M.
    expect(
      calcNetSalary({
        grossSalary: 5_000_000,
        deductions: [{ amount: 4, type: 'percent' }],
        nonSalaryBenefits: [{ amount: 1_000_000 }],
      })
    ).toBe(5_800_000)
  })

  it('AC-2.5: net never goes below 0 even if deductions exceed gross', () => {
    expect(
      calcNetSalary({
        grossSalary: 1_000_000,
        deductions: [{ amount: 5_000_000, type: 'fixed' }],
      })
    ).toBe(0)
  })
})
