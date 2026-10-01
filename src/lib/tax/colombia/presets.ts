import { calcFspRate } from './aportes'

export interface DeductionPreset {
  id: string
  label: string
  amount: number
  type: 'fixed' | 'percent'
}

export const FSP_LABEL = 'Fondo de Solidaridad Pensional'

// Colombia mandatory employee aporte: salud 4% + pensión 4%.
// ARL is excluded — Art. 16 Ley 1562/2012 makes ARL 100% employer cost.
const COLOMBIA_DEDUCTION_PRESETS: ReadonlyArray<Omit<DeductionPreset, 'id'>> = [
  { label: 'Salud', amount: 4, type: 'percent' },
  { label: 'Pensión', amount: 4, type: 'percent' },
]

// Idempotent: adds missing Salud/Pensión and upserts the Fondo de Solidaridad
// Pensional (Art. 27 Ley 100/1993) at the rate for `grossSalary` — removed when the
// salary is below 4 SMMLV.
export function applyColombiaPresets(
  deductions: DeductionPreset[],
  grossSalary: number,
  now: Date = new Date()
): DeductionPreset[] {
  const existing = new Set(deductions.map((d) => d.label.toLowerCase()))
  const additions = COLOMBIA_DEDUCTION_PRESETS.filter(
    (p) => !existing.has(p.label.toLowerCase())
  ).map((p) => ({ ...p, id: crypto.randomUUID() }))

  const fspPercent = Math.round(calcFspRate(grossSalary, now.getFullYear()) * 10_000) / 100
  const isFsp = (d: DeductionPreset) => d.label.toLowerCase() === FSP_LABEL.toLowerCase()
  const withoutFsp = deductions.filter((d) => !isFsp(d))
  const currentFsp = deductions.find(isFsp)

  const result = [...withoutFsp, ...additions]
  if (fspPercent > 0) {
    result.push({
      id: currentFsp?.id ?? crypto.randomUUID(),
      label: FSP_LABEL,
      amount: fspPercent,
      type: 'percent',
    })
  }
  return result
}
