import { describe, expect, it } from 'vitest'
import { calcAportesEmpleado, calcFspRate } from '@/lib/tax/colombia/aportes'
import { smmlvForYear, uvtForYear } from '@/lib/tax/colombia/constants'

const SMMLV_2026 = 1_750_905

describe('lib/tax/colombia/aportes — FSP and IBC cap', () => {
  it('uses the year tables, falling back to the closest earlier year', () => {
    expect(uvtForYear(2026)).toBe(52_374)
    expect(uvtForYear(2025)).toBe(49_799)
    expect(uvtForYear(2030)).toBe(52_374)
    expect(uvtForYear(2000)).toBe(49_799)
    expect(smmlvForYear(2026)).toBe(SMMLV_2026)
  })

  it('FSP is 0 below 4 SMMLV and 1% from 4 SMMLV (inclusive)', () => {
    expect(calcFspRate(4 * SMMLV_2026 - 1, 2026)).toBe(0)
    expect(calcFspRate(4 * SMMLV_2026, 2026)).toBe(0.01)
    expect(calcFspRate(0, 2026)).toBe(0)
  })

  it('FSP grows by bracket up to 2% from 20 SMMLV', () => {
    expect(calcFspRate(16 * SMMLV_2026, 2026)).toBe(0.012)
    expect(calcFspRate(19.5 * SMMLV_2026, 2026)).toBe(0.018)
    expect(calcFspRate(20 * SMMLV_2026, 2026)).toBe(0.02)
  })

  it('applies salud 4% + pensión 4% + FSP on the salary', () => {
    const a = calcAportesEmpleado(10_000_000, 2026)
    expect(a.salud).toBeCloseTo(400_000)
    expect(a.pension).toBeCloseTo(400_000)
    expect(a.fspRate).toBe(0.01)
    expect(a.total).toBeCloseTo(900_000)
  })

  it('caps the IBC at 25 SMMLV', () => {
    const a = calcAportesEmpleado(60_000_000, 2026)
    const ibc = 25 * SMMLV_2026
    expect(a.salud).toBeCloseTo(ibc * 0.04)
    expect(a.fsp).toBeCloseTo(ibc * 0.02)
    expect(a.total).toBeCloseTo(ibc * 0.1)
  })

  it('returns zeros for a non-positive salary', () => {
    expect(calcAportesEmpleado(0, 2026).total).toBe(0)
  })
})
