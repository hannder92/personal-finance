import { describe, expect, it } from 'vitest'
import { calcRetencion } from '@/lib/tax/colombia/retencion'

// Art. 383 ET marginal table for monthly retención en la fuente.
// Base = gross − aportes (salud 4% + pensión 4% + FSP, IBC capped at 25 SMMLV)
//        − min(rentaExenta, limite40%), where
//   rentaExenta = min(25% × ingresoNeto, 790/12 UVT)        (Art. 206 num. 10, Ley 2277/2022)
//   limite40%   = min(40% × ingresoNeto, 1.340/12 UVT)      (Art. 336 ET)
// UVT/SMMLV come from the date: 2025 → 49.799 / 1.423.500 · 2026 → 52.374 / 1.750.905.
// ARL is NOT in the employee deduction set (Art. 16 Ley 1562/2012 — 100% employer cost).
// Expected values were computed independently (spreadsheet-style script), not from the impl.

const IN_2026 = new Date(2026, 9, 1)
const IN_2025 = new Date(2025, 5, 15)

describe('lib/tax/colombia/retencion (Art. 383 ET)', () => {
  it('TC-U-035 (EC-7, AC-2.3): salary below threshold → 0 with belowThreshold=true', () => {
    // gross 1.5M → base 19.76 UVT, 0-95 UVT bracket (0%).
    const result = calcRetencion(1_500_000, IN_2026)
    expect(result.amount).toBe(0)
    expect(result.belowThreshold).toBe(true)
  })

  it('TC-U-034 (AC-2.3): gross=5M produces 0 retención (base 65.87 UVT < 95 UVT)', () => {
    const result = calcRetencion(5_000_000, IN_2026)
    expect(result.amount).toBe(0)
  })

  it('TC-U-036 (AC-2.3): gross=10M in 2026 includes FSP 1% and lands in 19% bracket', () => {
    // aportes 8% + FSP 1% (10M ≥ 4 SMMLV) = 900K → neto 9.1M → exenta 25% = 2.275M
    // base = 6.825M = 130.31 UVT → 19% × (130.31 − 95) = 6.709 UVT × 52.374 ≈ 351.399.
    const result = calcRetencion(10_000_000, IN_2026)
    expect(result.amount).toBeCloseTo(351_399, -1)
    expect(result.belowThreshold).toBe(false)
  })

  it('TC-U-036b: same salary in 2025 uses UVT 49.799 → higher retención', () => {
    // base 137.05 UVT → 19% × 42.05 × 49.799 ≈ 397.878.
    const result = calcRetencion(10_000_000, IN_2025)
    expect(result.amount).toBeCloseTo(397_878, -1)
  })

  it('TC-U-037 (AC-2.3): gross=60M caps renta exenta at 790/12 UVT and IBC at 25 SMMLV', () => {
    // IBC = 25 × 1.750.905 = 43.772.625 → aportes 8% + FSP 2% = 4.377.262,5
    // neto 55.622.737,5 → 25% = 13.9M, capped at 790/12 × 52.374 = 3.447.955
    // base = 52.174.782,5 = 996.20 UVT → 945-2300 bracket: 37% × 51.20 + 268 = 286.94 UVT
    // ≈ 15.028.332. The old 240 UVT/month cap would give ~12M (understated).
    const result = calcRetencion(60_000_000, IN_2026)
    expect(result.amount).toBeCloseTo(15_028_332, -1)
    expect(result.belowThreshold).toBe(false)
  })

  it('gross=30M in 2026 lands in the 33% bracket', () => {
    const result = calcRetencion(30_000_000, IN_2026)
    expect(result.amount).toBeCloseTo(5_223_350, -1)
  })

  it('AC-2.3: result is labeled as estimado', () => {
    const result = calcRetencion(10_000_000, IN_2026)
    expect(result.label).toBe('estimado')
  })
})
