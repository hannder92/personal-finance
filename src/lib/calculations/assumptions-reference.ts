// Colombia reference assumptions (20261002-proyecciones-reales, discovery §9, ADR-3).
// Bundled with the release — never fetched — so financial data stays local.
// Sources consulted 2026-10-02:
// - Inflation 5%: DANE IPC annual Aug-2026 6.24%; 2005–2025 geometric mean 4.88%;
//   last 10 years 5.63%; Banco de la República target 3% ± 1.
// - Return 9% E.A.: ≈ 4% real over 5% inflation. Current CDT 360d average 12.07% E.A. and
//   policy rate 12.25% are cyclical highs, not 10–30 year assumptions.
// - Withdrawal 4%: classic safe withdrawal rule (25× annual spending).
// Update these values (and `asOf`) only with a new release and cited source.

export interface ReferenceAssumptions {
  inflationPercent: number
  annualReturnPercent: number
  withdrawalRatePercent: number
  /** Year-month the values were consulted (shown to the user with the source). */
  asOf: string
}

export const COLOMBIA_REFERENCE: Readonly<ReferenceAssumptions> = Object.freeze({
  inflationPercent: 5,
  annualReturnPercent: 9,
  withdrawalRatePercent: 4,
  asOf: '2026-10',
})
