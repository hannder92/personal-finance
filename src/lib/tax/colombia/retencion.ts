import { calcAportesEmpleado } from './aportes'
import {
  ART_383_BRACKETS,
  EXENTAS_LIMIT_PCT,
  EXENTAS_LIMIT_UVT,
  RENTA_EXENTA_CAP_UVT,
  RENTA_EXENTA_PCT,
  uvtForYear,
} from './constants'

export interface RetencionResult {
  amount: number
  label: string
  belowThreshold: boolean
}

// Monthly retención en la fuente for salaried employees (procedimiento 1, Art. 383/388 ET).
// 1. Ingresos no constitutivos: aportes obligatorios salud + pensión + FSP.
// 2. Renta exenta 25% (Art. 206 num. 10), capped at 790 UVT/year (790/12 per month).
// 3. Deducciones + rentas exentas limited to 40% of the net income and 1.340 UVT/year.
// 4. Art. 383 marginal table applied to the depurated base in UVT.
// Voluntary deductions (dependientes, prepagada, AFC, vivienda) are not modelled yet.
export function calcRetencion(grossSalary: number, now: Date = new Date()): RetencionResult {
  if (grossSalary <= 0) {
    return { amount: 0, label: 'estimado', belowThreshold: true }
  }

  const year = now.getFullYear()
  const uvt = uvtForYear(year)
  const aportes = calcAportesEmpleado(grossSalary, year).total
  const ingresoNeto = grossSalary - aportes
  const rentaExenta = Math.min(ingresoNeto * RENTA_EXENTA_PCT, RENTA_EXENTA_CAP_UVT * uvt)
  const limiteGlobal = Math.min(ingresoNeto * EXENTAS_LIMIT_PCT, EXENTAS_LIMIT_UVT * uvt)
  const baseGravable = ingresoNeto - Math.min(rentaExenta, limiteGlobal)
  const baseGravableUVT = baseGravable / uvt

  const bracket = findBracket(baseGravableUVT)
  const lowerUVT = lowerBoundary(bracket)
  const marginalUVT = (baseGravableUVT - lowerUVT) * bracket.rate + bracket.constantUVT
  const amount = Math.round(marginalUVT * uvt)

  return {
    amount: Math.max(0, amount),
    label: 'estimado',
    belowThreshold: baseGravableUVT < 95,
  }
}

function findBracket(baseGravableUVT: number) {
  for (const b of ART_383_BRACKETS) {
    if (baseGravableUVT < b.upperUVT) return b
  }
  // Unreachable because the last bracket has `upperUVT: Infinity`, but TS needs a fallback.
  return ART_383_BRACKETS[ART_383_BRACKETS.length - 1]!
}

function lowerBoundary(bracket: (typeof ART_383_BRACKETS)[number]): number {
  const index = ART_383_BRACKETS.indexOf(bracket)
  if (index <= 0) return 0
  return ART_383_BRACKETS[index - 1]!.upperUVT
}
