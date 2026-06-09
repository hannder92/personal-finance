// T-006 — Covers: AC-2.1–2.4, EC-5 · TC-U-004, TC-U-005, TC-U-012
import { describe, expect, it } from 'vitest'
import { calcSpendingPace } from '@/lib/calculations/spending-pace'

describe('calcSpendingPace (TC-U-004, TC-U-005, TC-U-012)', () => {
  it('TC-U-004: ahead when spent % of last month exceeds elapsed % (AC-2.2)', () => {
    const r = calcSpendingPace({
      currentVariableSpent: 700_000,
      previousVariableTotal: 1_000_000,
      dayOfMonth: 15,
      daysInMonth: 30,
    })
    expect(r.status).toBe('ahead')
    expect(r.spentPct).toBe(70)
    expect(r.elapsedPct).toBe(50)
  })

  it('TC-U-004: below when spent % is under elapsed % (AC-2.3)', () => {
    const r = calcSpendingPace({
      currentVariableSpent: 400_000,
      previousVariableTotal: 1_000_000,
      dayOfMonth: 15,
      daysInMonth: 30,
    })
    expect(r.status).toBe('below')
    expect(r.spentPct).toBe(40)
  })

  it('TC-U-004: exact tie (spentPct == elapsedPct) is below — "menor o igual"', () => {
    const r = calcSpendingPace({
      currentVariableSpent: 500_000,
      previousVariableTotal: 1_000_000,
      dayOfMonth: 15,
      daysInMonth: 30,
    })
    expect(r.status).toBe('below')
  })

  it('TC-U-005: none without previous month total (AC-2.4)', () => {
    const r = calcSpendingPace({
      currentVariableSpent: 300_000,
      previousVariableTotal: null,
      dayOfMonth: 10,
      daysInMonth: 30,
    })
    expect(r.status).toBe('none')
    expect(Number.isNaN(r.spentPct)).toBe(false)
    expect(Number.isFinite(r.elapsedPct)).toBe(true)
  })

  it('TC-U-005: previous total of 0 is none, never division by zero (EC-5)', () => {
    const r = calcSpendingPace({
      currentVariableSpent: 300_000,
      previousVariableTotal: 0,
      dayOfMonth: 10,
      daysInMonth: 30,
    })
    expect(r.status).toBe('none')
    expect(Number.isNaN(r.spentPct)).toBe(false)
    expect(Number.isFinite(r.spentPct)).toBe(true)
  })

  it('TC-U-012: elapsedPct uses natural days for 28/30/31-day months (AC-2.1)', () => {
    expect(
      calcSpendingPace({
        currentVariableSpent: 0,
        previousVariableTotal: 100,
        dayOfMonth: 14,
        daysInMonth: 28,
      }).elapsedPct
    ).toBe(50)
    expect(
      calcSpendingPace({
        currentVariableSpent: 0,
        previousVariableTotal: 100,
        dayOfMonth: 15,
        daysInMonth: 30,
      }).elapsedPct
    ).toBe(50)
    expect(
      calcSpendingPace({
        currentVariableSpent: 0,
        previousVariableTotal: 100,
        dayOfMonth: 31,
        daysInMonth: 31,
      }).elapsedPct
    ).toBe(100)
  })

  it('TC-U-012: percentages are rounded to integers for display', () => {
    const r = calcSpendingPace({
      currentVariableSpent: 333_333,
      previousVariableTotal: 1_000_000,
      dayOfMonth: 10,
      daysInMonth: 31,
    })
    expect(Number.isInteger(r.spentPct)).toBe(true)
    expect(Number.isInteger(r.elapsedPct)).toBe(true)
  })
})
