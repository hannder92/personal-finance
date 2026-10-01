import { describe, expect, it } from 'vitest'
import { applyColombiaPresets, FSP_LABEL, type DeductionPreset } from '@/lib/tax/colombia/presets'

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

describe('applyColombiaPresets — Fondo de Solidaridad Pensional', () => {
  const IN_2026 = new Date(2026, 9, 1)

  it('adds FSP at 1% for a salary of 4 SMMLV or more', () => {
    const out = applyColombiaPresets([], 8_000_000, IN_2026)
    const fsp = out.find((d) => d.label === FSP_LABEL)
    expect(fsp).toMatchObject({ amount: 1, type: 'percent' })
  })

  it('does not add FSP below 4 SMMLV and removes a stale one', () => {
    const stale = [{ id: 'x', label: FSP_LABEL, amount: 1, type: 'percent' as const }]
    const out = applyColombiaPresets(stale, 3_000_000, IN_2026)
    expect(out.find((d) => d.label === FSP_LABEL)).toBeUndefined()
  })

  it('updates the FSP rate in place (same id) when the salary changes', () => {
    const first = applyColombiaPresets([], 8_000_000, IN_2026)
    const fspId = first.find((d) => d.label === FSP_LABEL)!.id
    const second = applyColombiaPresets(first, 40_000_000, IN_2026)
    const fsp = second.filter((d) => d.label === FSP_LABEL)
    expect(fsp).toHaveLength(1)
    expect(fsp[0]).toMatchObject({ id: fspId, amount: 2 })
  })
})
