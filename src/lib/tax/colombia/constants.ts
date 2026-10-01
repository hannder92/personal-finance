// UVT — Unidad de Valor Tributario, one value per tax year.
// 2025: Resolución DIAN 000187 del 28-nov-2024.
// 2026: Resolución DIAN 000238 de 2025 ($52.374).
export const UVT_2025 = 49_799
export const UVT_2026 = 52_374

export const UVT_BY_YEAR: Readonly<Record<number, number>> = {
  2025: UVT_2025,
  2026: UVT_2026,
}

// SMMLV — salario mínimo legal mensual vigente.
// 2025: Decreto 1572/2024. 2026: Decreto 1469/2025 ($1.750.905; the provisional
// suspension of Feb-2026 was revoked by the Consejo de Estado).
export const SMMLV_BY_YEAR: Readonly<Record<number, number>> = {
  2025: 1_423_500,
  2026: 1_750_905,
}

// Returns the value for `year`, or the closest earlier known year; years before the
// first known one fall back to the earliest value. Keeps calculations working on
// January 1st before a new resolution is added to the table.
function valueForYear(table: Readonly<Record<number, number>>, year: number): number {
  const years = Object.keys(table)
    .map(Number)
    .sort((a, b) => a - b)
  let chosen = years[0]!
  for (const y of years) {
    if (y <= year) chosen = y
  }
  return table[chosen]!
}

export function uvtForYear(year: number): number {
  return valueForYear(UVT_BY_YEAR, year)
}

export function smmlvForYear(year: number): number {
  return valueForYear(SMMLV_BY_YEAR, year)
}

// Renta exenta laboral (Art. 206 numeral 10 ET, modified by Ley 2277/2022 art. 7):
// 25% of the depurated labor income, capped at 790 UVT per year → 790/12 UVT per month.
export const RENTA_EXENTA_PCT = 0.25
export const RENTA_EXENTA_CAP_UVT_ANNUAL = 790
export const RENTA_EXENTA_CAP_UVT = RENTA_EXENTA_CAP_UVT_ANNUAL / 12

// Global limit for deductions + rentas exentas (Art. 336 ET, Ley 2277/2022):
// 40% of (ingreso − ingresos no constitutivos), capped at 1.340 UVT per year.
export const EXENTAS_LIMIT_PCT = 0.4
export const EXENTAS_LIMIT_UVT_ANNUAL = 1340
export const EXENTAS_LIMIT_UVT = EXENTAS_LIMIT_UVT_ANNUAL / 12

// Aporte obligatorio del trabajador a salud y pensión: 4% + 4% = 8%.
// (Art. 204 Ley 100/1993 — salud; Art. 20 Ley 100/1993 — pensión).
// ARL (Art. 16 Ley 1562/2012) is 100% employer cost — NOT included here.
export const APORTE_SALUD = 0.04
export const APORTE_PENSION = 0.04
export const APORTE_SOCIAL_TOTAL = APORTE_SALUD + APORTE_PENSION

// Ingreso base de cotización is capped at 25 SMMLV (Art. 18 Ley 100/1993).
export const IBC_CAP_SMMLV = 25

// Fondo de Solidaridad Pensional (Art. 27 Ley 100/1993, modified by Art. 8 Ley 797/2003).
// Employee pays it on top of pensión when IBC ≥ 4 SMMLV. `fromSmmlv` is inclusive.
// The higher rates of Ley 2381/2024 are not applied: that law is suspended by the
// Constitutional Court as of 2026.
export interface FspBracket {
  readonly fromSmmlv: number
  readonly rate: number
}

export const FSP_BRACKETS: readonly FspBracket[] = [
  { fromSmmlv: 4, rate: 0.01 },
  { fromSmmlv: 16, rate: 0.012 },
  { fromSmmlv: 17, rate: 0.014 },
  { fromSmmlv: 18, rate: 0.016 },
  { fromSmmlv: 19, rate: 0.018 },
  { fromSmmlv: 20, rate: 0.02 },
]

// Art. 383 ET marginal table (monthly retención).
// Modified by Ley 2277/2022, art. 4. Brackets in UVT, marginal rate per bracket,
// and the constant in UVT added at the start of the bracket (as written in the law:
// 10, 69, 162, 268, 770 UVT).
export interface MarginalBracket {
  readonly upperUVT: number // exclusive upper boundary; `Infinity` for the top bracket
  readonly rate: number // marginal rate
  readonly constantUVT: number // constant added at the start of the bracket
}

export const ART_383_BRACKETS: readonly MarginalBracket[] = [
  { upperUVT: 95, rate: 0, constantUVT: 0 },
  { upperUVT: 150, rate: 0.19, constantUVT: 0 },
  { upperUVT: 360, rate: 0.28, constantUVT: 10 },
  { upperUVT: 640, rate: 0.33, constantUVT: 69 },
  { upperUVT: 945, rate: 0.35, constantUVT: 162 },
  { upperUVT: 2300, rate: 0.37, constantUVT: 268 },
  { upperUVT: Infinity, rate: 0.39, constantUVT: 770 },
]
