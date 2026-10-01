import {
  APORTE_SOCIAL_TOTAL,
  ART_383_BRACKETS,
  RENTA_EXENTA_CAP_UVT_MENSUAL,
  RENTA_EXENTA_PCT,
  uvtForYear,
} from './constants'

export interface RetencionResult {
  amount: number
  label: string
  belowThreshold: boolean
}

// Monthly retención en la fuente for salaried employees (Art. 383 ET).
// Formula: base = gross − aporteSocial(8%) − min(25% × ingresoNominal, 790/12 × UVT).
// The marginal table is applied to the base expressed in UVT of the given tax year.
export function calcRetencion(
  grossSalary: number,
  year: number = new Date().getFullYear()
): RetencionResult {
  if (grossSalary <= 0) {
    return { amount: 0, label: 'estimado', belowThreshold: true }
  }

  const uvt = uvtForYear(year)
  const aporteSocial = grossSalary * APORTE_SOCIAL_TOTAL
  const ingresoNominal = grossSalary - aporteSocial
  const rentaExenta = Math.min(
    ingresoNominal * RENTA_EXENTA_PCT,
    RENTA_EXENTA_CAP_UVT_MENSUAL * uvt
  )
  const baseGravable = ingresoNominal - rentaExenta
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
