// UVT 2025 — Unidad de Valor Tributario, Resolución DIAN 000187 del 28-nov-2024.
// https://www.dian.gov.co/normatividad/Normatividad/Resoluci%C3%B3n%20000187%20del%2028-11-2024.pdf
export const UVT_2025 = 49_799

// Renta exenta cap (Art. 206 numeral 10 ET, monthly equivalent).
// 240 UVT/month → 2,880 UVT/year. NOT 65.833 UVT/month (which is 790 UVT/year — incorrect for this item).
export const RENTA_EXENTA_CAP_UVT = 240

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

// Salario Mínimo Mensual Legal Vigente 2025 — Decreto 1572 de 2024 ($1.423.500/mes).
export const SMMLV_2025 = 1_423_500

// Solidarity-fund threshold: salaries > 4 SMMLV pay 1% to Fondo de Solidaridad Pensional
// (Ley 100/1993 Art. 20 modified by Ley 797/2003). Exclusive: at exactly 4 SMMLV, no contribution.
export const SOLIDARITY_THRESHOLD = SMMLV_2025 * 4

// Transport-allowance threshold: salaries ≤ 2 SMMLV are entitled to auxilio de transporte
// (Ley 15/1959 Art. 2 + Decreto 1572/2024). Inclusive: at exactly 2 SMMLV, allowance applies.
export const TRANSPORT_THRESHOLD = SMMLV_2025 * 2

// Auxilio de transporte 2025 (Decreto 1572 de 2024). Non-salary; added after deductions.
export const AUXILIO_TRANSPORTE_2025 = 200_000
