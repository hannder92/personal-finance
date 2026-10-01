import {
  APORTE_PENSION,
  APORTE_SALUD,
  FSP_BRACKETS,
  IBC_CAP_SMMLV,
  smmlvForYear,
} from './constants'

export interface AportesEmpleado {
  salud: number
  pension: number
  fsp: number
  fspRate: number
  total: number
}

// Fondo de Solidaridad Pensional rate for a monthly IBC (0 below 4 SMMLV).
export function calcFspRate(grossSalary: number, year: number): number {
  const smmlv = smmlvForYear(year)
  if (grossSalary <= 0 || smmlv <= 0) return 0
  const inSmmlv = grossSalary / smmlv
  let rate = 0
  for (const b of FSP_BRACKETS) {
    if (inSmmlv >= b.fromSmmlv) rate = b.rate
  }
  return rate
}

// Mandatory employee contributions (ingresos no constitutivos de renta) on a monthly
// salary. IBC is capped at 25 SMMLV (Art. 18 Ley 100/1993).
export function calcAportesEmpleado(grossSalary: number, year: number): AportesEmpleado {
  if (grossSalary <= 0) return { salud: 0, pension: 0, fsp: 0, fspRate: 0, total: 0 }
  const ibc = Math.min(grossSalary, IBC_CAP_SMMLV * smmlvForYear(year))
  const fspRate = calcFspRate(ibc, year)
  const salud = ibc * APORTE_SALUD
  const pension = ibc * APORTE_PENSION
  const fsp = ibc * fspRate
  return { salud, pension, fsp, fspRate, total: salud + pension + fsp }
}
