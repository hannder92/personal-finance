import { describe, expect, it } from 'vitest'
import { applyColombiaPresets, type DeductionPreset } from '@/lib/tax/colombia/presets'

describe('lib/tax/colombia/presets', () => {
  it('TC-U-038 (AC-2.2): inserts Salud 4% + Pensión 4% only; no ARL', () => {
    const result = applyColombiaPresets([], 5_000_000)
    expect(result).toHaveLength(2)
    const labels = result.map((d) => d.label.toLowerCase())
    expect(labels).toEqual(expect.arrayContaining(['salud', 'pensión']))
    // Constitution v2: ARL is 100% employer cost (Art. 16 Ley 1562/2012) — MUST NOT be a preset.
    expect(labels).not.toContain('arl')
    // All Colombia aporte presets are percent-type with value 4 (interpreted as 4%).
    for (const d of result) {
      expect(d.type).toBe('percent')
      expect(d.amount).toBe(4)
    }
  })

  it('TC-U-039 (AC-2.2): idempotent when Salud already present (no duplicate)', () => {
    const existing: DeductionPreset[] = [
      { id: 'existing-salud', label: 'Salud', amount: 4, type: 'percent' },
    ]
    const result = applyColombiaPresets(existing, 5_000_000)
    expect(result).toHaveLength(2)
    // Existing entry preserved (same id), Pensión added.
    expect(result.find((d) => d.id === 'existing-salud')).toBeTruthy()
    expect(result.filter((d) => d.label.toLowerCase() === 'salud')).toHaveLength(1)
  })

  it('AC-2.2: idempotent when both Salud and Pensión already present (no change)', () => {
    const existing: DeductionPreset[] = [
      { id: 's', label: 'Salud', amount: 4, type: 'percent' },
      { id: 'p', label: 'Pensión', amount: 4, type: 'percent' },
    ]
    const result = applyColombiaPresets(existing, 5_000_000)
    expect(result).toHaveLength(2)
  })

  it('AC-2.2: returns NEW array (does not mutate input)', () => {
    const input: DeductionPreset[] = []
    const result = applyColombiaPresets(input, 5_000_000)
    expect(input).toHaveLength(0)
    expect(result).not.toBe(input)
  })

  // ───────────────────────────────────────────────────────────────────────────
  // sprint1-mejoras-finanzas (AC-4.1..4.3) — Solidarity fund preset
  // SMMLV 2025 = 1_423_500; threshold = 4 × SMMLV = 5_694_000 (Ley 100/1993 Art. 20).
  // ───────────────────────────────────────────────────────────────────────────

  it('TC-U-007 (AC-4.1): adds solidarity 1% when gross > 4 SMMLV (5_694_000)', () => {
    const base: DeductionPreset[] = [
      { id: 's', label: 'Salud', amount: 4, type: 'percent' },
      { id: 'p', label: 'Pensión', amount: 4, type: 'percent' },
    ]
    const result = applyColombiaPresets(base, 6_000_000)
    const solidarity = result.find((d) => d.id === '__solidarity__')
    expect(solidarity).toBeTruthy()
    expect(solidarity?.type).toBe('percent')
    expect(solidarity?.amount).toBe(1)
  })

  it('TC-U-008 (AC-4.2): no solidarity at boundary salary = 4 SMMLV exactly (5_694_000)', () => {
    const result = applyColombiaPresets([], 5_694_000)
    expect(result.find((d) => d.id === '__solidarity__')).toBeFalsy()
  })

  it('TC-U-009 (AC-4.3): solidarity not duplicated on second apply', () => {
    const base: DeductionPreset[] = [
      { id: '__solidarity__', label: 'Fondo solidaridad', amount: 1, type: 'percent' },
    ]
    const result = applyColombiaPresets(base, 6_000_000)
    const matches = result.filter((d) => d.id === '__solidarity__')
    expect(matches).toHaveLength(1)
  })

  it('TC-U-010 (AC-4.1/4.2): below-threshold salary (4_000_000) yields no solidarity', () => {
    const result = applyColombiaPresets([], 4_000_000)
    expect(result.find((d) => d.id === '__solidarity__')).toBeFalsy()
  })
})
