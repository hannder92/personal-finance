import { describe, expect, it } from 'vitest'
import { calcRetencion } from '@/lib/tax/colombia/retencion'
import {
  RENTA_EXENTA_CAP_UVT_MENSUAL,
  UVT_2025,
  UVT_2026,
  uvtForYear,
} from '@/lib/tax/colombia/constants'

// Art. 383 ET marginal table for monthly retención en la fuente.
// UVT 2026 = $52,374 (Resolución DIAN 000238/2025); UVT 2025 = $49,799 (Resolución DIAN 000187/2024).
// Base = gross − salud(4%) − pensión(4%) − min(25% × ingresoNominal, 790/12 × UVT).
// Cap: Art. 206 num. 10 ET as modified by Ley 2277/2022 → 790 UVT/year (65.833 UVT/month).
// ARL is NOT in the employee deduction set (Art. 16 Ley 1562/2012 — 100% employer cost).

describe('lib/tax/colombia/constants (UVT)', () => {
  it('returns the DIAN value for each known year', () => {
    expect(uvtForYear(2025)).toBe(49_799)
    expect(uvtForYear(2026)).toBe(52_374)
  })

  it('falls back to the nearest known year outside the table', () => {
    expect(uvtForYear(2024)).toBe(UVT_2025)
    expect(uvtForYear(2027)).toBe(UVT_2026)
  })

  it('renta exenta cap is 790 UVT per year (Ley 2277/2022), not 240 UVT per month', () => {
    expect(RENTA_EXENTA_CAP_UVT_MENSUAL * 12).toBeCloseTo(790)
  })
})

describe('lib/tax/colombia/retencion (Art. 383 ET)', () => {
  it('TC-U-035 (EC-7, AC-2.3): salary below threshold → 0 with belowThreshold=true', () => {
    // gross 1.5M → aporte 120K → ingresoNominal 1.38M → rentaExenta 345K
    // baseGravable = 1.035M = 19.76 UVT, falls in 0-95 UVT bracket (0%).
    const result = calcRetencion(1_500_000, 2026)
    expect(result.amount).toBe(0)
    expect(result.belowThreshold).toBe(true)
  })

  it('TC-U-034 (AC-2.3): gross=5M produces 0 retención (baseGravable 65.87 UVT < 95 UVT)', () => {
    // gross 5M → aporte 400K → ingresoNominal 4.6M → rentaExenta 1.15M (below the 3_447_955 cap)
    // baseGravable = 3.45M = 65.87 UVT, falls in 0-95 UVT bracket (0%).
    const result = calcRetencion(5_000_000, 2026)
    expect(result.amount).toBe(0)
  })

  it('TC-U-036 (AC-2.3): gross=10M uses salud+pensión (8%) base, lands in 19% bracket', () => {
    // gross 10M → aporte 800K → ingresoNominal 9.2M → rentaExenta 2.3M (below the cap)
    // baseGravable = 6.9M = 131.74 UVT, falls in 95-150 UVT bracket (19%).
    // marginalUVT = 19% × (131.74 − 95) = 6.98 UVT × 52_374 ≈ 365_649 COP.
    const result = calcRetencion(10_000_000, 2026)
    expect(result.amount).toBe(365_649)
    expect(result.belowThreshold).toBe(false)
  })

  it('TC-U-037 (AC-2.3): gross=30M renta exenta CAPPED at 790/12 UVT', () => {
    // gross 30M → aporte 2.4M → ingresoNominal 27.6M → 25% = 6.9M
    // cap = 790/12 × 52_374 = 3_447_955 → CAPPED.
    // baseGravable = 27.6M − 3_447_955 = 24_152_045 = 461.15 UVT → 360-640 bracket (33%).
    // marginal = 33% × (461.15 − 360) + 69 = 102.38 UVT × 52_374 ≈ 5_361_950 COP.
    // With the old 240 UVT/month cap the result was ≈ 4.35M (under-withholding).
    const result = calcRetencion(30_000_000, 2026)
    expect(result.amount).toBe(5_361_950)
    expect(result.belowThreshold).toBe(false)
  })

  it('TC-U-037b (AC-2.3): gross=60M renta exenta capped, lands in 37% bracket', () => {
    // ingresoNominal 55.2M → 25% = 13.8M → capped to 3_447_955.
    // baseGravable = 51_752_045 = 988.12 UVT → 945-2300 bracket (37%).
    // marginal = 37% × (988.12 − 945) + 268.75 = 284.71 UVT × 52_374 ≈ 14_911_200 COP.
    const result = calcRetencion(60_000_000, 2026)
    expect(result.amount).toBe(14_911_200)
  })

  it('uses the UVT of the requested tax year', () => {
    // Same gross 10M with UVT 2025: base 6.9M = 138.56 UVT → 19% × 43.56 = 8.28 UVT × 49_799.
    expect(calcRetencion(10_000_000, 2025).amount).toBe(412_128)
  })

  it('AC-2.3: result is labeled as estimado', () => {
    const result = calcRetencion(10_000_000, 2026)
    expect(result.label).toBe('estimado')
  })
})
