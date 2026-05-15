export interface DeductionPreset {
  id: string
  label: string
  amount: number
  type: 'fixed' | 'percent'
}

// Colombia mandatory employee aporte: salud 4% + pensión 4%.
// ARL is excluded — Art. 16 Ley 1562/2012 makes ARL 100% employer cost.
const COLOMBIA_DEDUCTION_PRESETS: ReadonlyArray<Omit<DeductionPreset, 'id'>> = [
  { label: 'Salud', amount: 4, type: 'percent' },
  { label: 'Pensión', amount: 4, type: 'percent' },
]

export function applyColombiaPresets(
  deductions: DeductionPreset[],
  _grossSalary: number
): DeductionPreset[] {
  const existing = new Set(deductions.map((d) => d.label.toLowerCase()))
  const additions = COLOMBIA_DEDUCTION_PRESETS.filter(
    (p) => !existing.has(p.label.toLowerCase())
  ).map((p) => ({ ...p, id: crypto.randomUUID() }))
  return [...deductions, ...additions]
}
