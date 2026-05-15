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
})
