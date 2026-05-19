import { SOLIDARITY_THRESHOLD } from './constants'

export interface DeductionPreset {
  id: string
  label: string
  amount: number
  type: 'fixed' | 'percent'
}

// Reserved id slug for the solidarity-fund preset. Stable id makes the preset
// idempotent (applying twice does not duplicate) and recognizable from the UI.
export const SOLIDARITY_PRESET_ID = '__solidarity__'

// Colombia mandatory employee aporte: salud 4% + pensión 4%.
// ARL is excluded — Art. 16 Ley 1562/2012 makes ARL 100% employer cost.
const COLOMBIA_DEDUCTION_PRESETS: ReadonlyArray<Omit<DeductionPreset, 'id'>> = [
  { label: 'Salud', amount: 4, type: 'percent' },
  { label: 'Pensión', amount: 4, type: 'percent' },
]

// Fondo de Solidaridad Pensional 1% — Ley 100/1993 Art. 20 (modified by Ley 797/2003).
// Applies only when gross > 4 SMMLV. Exclusive at the boundary.
const SOLIDARITY_PRESET: Omit<DeductionPreset, 'id'> = {
  label: 'Fondo solidaridad',
  amount: 1,
  type: 'percent',
}

export function applyColombiaPresets(
  deductions: DeductionPreset[],
  grossSalary: number
): DeductionPreset[] {
  const existingLabels = new Set(deductions.map((d) => d.label.toLowerCase()))
  const existingIds = new Set(deductions.map((d) => d.id))

  const labelAdditions = COLOMBIA_DEDUCTION_PRESETS.filter(
    (p) => !existingLabels.has(p.label.toLowerCase())
  ).map((p) => ({ ...p, id: crypto.randomUUID() }))

  let next = [...deductions, ...labelAdditions]
  if (grossSalary > SOLIDARITY_THRESHOLD && !existingIds.has(SOLIDARITY_PRESET_ID)) {
    next = [...next, { ...SOLIDARITY_PRESET, id: SOLIDARITY_PRESET_ID }]
  }
  return next
}
