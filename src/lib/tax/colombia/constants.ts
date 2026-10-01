// UVT — Unidad de Valor Tributario, fixed yearly by DIAN (Art. 868 ET).
// 2025: Resolución DIAN 000187 del 28-nov-2024.
// 2026: Resolución DIAN 000238 del 15-dic-2025.
export const UVT_2025 = 49_799
export const UVT_2026 = 52_374

export const UVT_BY_YEAR: Readonly<Record<number, number>> = {
  2025: UVT_2025,
  2026: UVT_2026,
}

const KNOWN_UVT_YEARS = Object.keys(UVT_BY_YEAR)
  .map(Number)
  .sort((a, b) => a - b)

// UVT for a given tax year. Years outside the table fall back to the nearest known year
// (the latest one for future years, until DIAN publishes the new value and it is added above).
export function uvtForYear(year: number): number {
  const exact = UVT_BY_YEAR[year]
  if (exact !== undefined) return exact
  const first = KNOWN_UVT_YEARS[0]!
  const last = KNOWN_UVT_YEARS[KNOWN_UVT_YEARS.length - 1]!
  return UVT_BY_YEAR[year < first ? first : last]!
}

// Renta exenta cap (Art. 206 numeral 10 ET, as modified by Ley 2277/2022, art. 2):
// 25% of labor payments, limited to 790 UVT per year. Monthly retención applies 790/12 UVT.
export const RENTA_EXENTA_CAP_UVT_ANUAL = 790
export const RENTA_EXENTA_CAP_UVT_MENSUAL = RENTA_EXENTA_CAP_UVT_ANUAL / 12

// Aporte obligatorio del trabajador a salud y pensión: 4% + 4% = 8%.
// (Art. 204 Ley 100/1993 — salud; Art. 20 Ley 100/1993 — pensión).
// ARL (Art. 16 Ley 1562/2012) is 100% employer cost — NOT included here.
export const APORTE_SALUD = 0.04
export const APORTE_PENSION = 0.04
export const APORTE_SOCIAL_TOTAL = APORTE_SALUD + APORTE_PENSION

// Renta exenta laboral (Art. 206 numeral 10 ET): 25% of ingreso laboral after aportes.
export const RENTA_EXENTA_PCT = 0.25

// Art. 383 ET marginal table (monthly retención).
// Modified by Ley 2277/2022, art. 4. Brackets in UVT, marginal rate per bracket,
// and the constant in UVT added cumulatively at each upper boundary.
export interface MarginalBracket {
  readonly upperUVT: number // exclusive upper boundary; `Infinity` for the top bracket
  readonly rate: number // marginal rate
  readonly constantUVT: number // cumulative constant added at the start of the bracket
}

export const ART_383_BRACKETS: readonly MarginalBracket[] = [
  { upperUVT: 95, rate: 0, constantUVT: 0 },
  { upperUVT: 150, rate: 0.19, constantUVT: 0 },
  { upperUVT: 360, rate: 0.28, constantUVT: 10 },
  { upperUVT: 640, rate: 0.33, constantUVT: 69 },
  { upperUVT: 945, rate: 0.35, constantUVT: 162 },
  { upperUVT: 2300, rate: 0.37, constantUVT: 268.75 },
  { upperUVT: Infinity, rate: 0.39, constantUVT: 770.1 },
]
