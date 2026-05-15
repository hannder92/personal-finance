import { describe, expect, it } from 'vitest'
import { calcRetencion } from '@/lib/tax/colombia/retencion'

// Art. 383 ET marginal table for monthly retención en la fuente.
// UVT 2025 = $49,799 (Resolución DIAN 000187/2024).
// Base = gross − salud(4%) − pensión(4%) − min(25% × ingresoNominal, 240 × UVT).
// ARL is NOT in the employee deduction set (Art. 16 Ley 1562/2012 — 100% employer cost).

describe('lib/tax/colombia/retencion (Art. 383 ET)', () => {
  it('TC-U-035 (EC-7, AC-2.3): salary below threshold → 0 with belowThreshold=true', () => {
    // gross 1.5M → aporte 120K → ingresoNominal 1.38M → rentaExenta 345K
    // baseGravable = 1.035M = 20.78 UVT, falls in 0-95 UVT bracket (0%).
    const result = calcRetencion(1_500_000)
    expect(result.amount).toBe(0)
    expect(result.belowThreshold).toBe(true)
  })

  it('TC-U-034 (AC-2.3): gross=5M produces 0 retención (baseGravable 69.28 UVT < 95 UVT)', () => {
    // gross 5M → aporte 400K → ingresoNominal 4.6M → rentaExenta 1.15M
    // baseGravable = 3.45M = 69.28 UVT, falls in 0-95 UVT bracket (0%).
    const result = calcRetencion(5_000_000)
    expect(result.amount).toBe(0)
  })

  it('TC-U-036 (AC-2.3): gross=10M uses salud+pensión (8%) base, lands in 19% bracket', () => {
    // gross 10M → aporte 800K → ingresoNominal 9.2M → rentaExenta 2.3M
    // baseGravable = 6.9M = 138.56 UVT, falls in 95-150 UVT bracket (19%).
    // marginalUVT = 19% × (138.56 - 95) = 8.276 UVT × 49_799 ≈ 412_120 COP.
    // If only pensión (4%) were deducted (wrong), base would be different and retención
    // value would not match this expected range.
    const result = calcRetencion(10_000_000)
    expect(result.amount).toBeGreaterThan(400_000)
    expect(result.amount).toBeLessThan(425_000)
    expect(result.belowThreshold).toBe(false)
  })

  it('TC-U-037 (AC-2.3): gross=60M renta exenta CAPPED at 240 UVT (not 65.833 UVT)', () => {
    // gross 60M → aporte 4.8M → ingresoNominal 55.2M → 25% × 55.2M = 13.8M
    // 240 × UVT_2025 = 240 × 49_799 = 11_951_760 → CAPPED to 11_951_760.
    // baseGravable = 55.2M − 11_951_760 = 43_248_240 = 868.4 UVT → 640-945 bracket (35%).
    // marginal = 35% × (868.4 − 640) + 162 = 241.94 UVT × 49_799 ≈ 12_047_894 COP.
    // If the WRONG cap (65.833 UVT × 49_799 = 3_278_337) were used, retención would
    // be ≥ 16M because baseGravable would be larger.
    const result = calcRetencion(60_000_000)
    expect(result.amount).toBeGreaterThan(11_500_000)
    expect(result.amount).toBeLessThan(12_500_000)
    expect(result.belowThreshold).toBe(false)
  })

  it('AC-2.3: result is labeled as estimado', () => {
    const result = calcRetencion(10_000_000)
    expect(result.label).toBe('estimado')
  })
})
