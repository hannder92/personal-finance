// Real projections (20261002-proyecciones-reales, spec rules R-1…R-6).
// Targets are expressed in today's pesos and grow with inflation; the balance and a
// flat nominal monthly contribution (paid at month end) compound at the expected return.

/** Search horizon for R-4: beyond 100 years a target is treated as unreachable (EC-5). */
export const MAX_PROJECTION_MONTHS = 1200

/** Real rates above this (in %) are flagged as an optimistic assumption (AC-1.4). */
export const OPTIMISTIC_REAL_RATE_PERCENT = 7

// Tolerance for float drift when comparing a compounded balance to an inflated target.
const EPSILON = 1e-6

/** R-1: monthly equivalent of an effective annual rate given in percent. */
export function monthlyRate(annualPercent: number): number {
  if (annualPercent === 0) return 0
  return (1 + annualPercent / 100) ** (1 / 12) - 1
}

/** R-5: real return in percent, (1 + return) / (1 + inflation) − 1. */
export function realRatePercent(annualReturnPercent: number, inflationPercent: number): number {
  return ((1 + annualReturnPercent / 100) / (1 + inflationPercent / 100) - 1) * 100
}

export function isOptimisticRealRate(
  annualReturnPercent: number,
  inflationPercent: number
): boolean {
  return realRatePercent(annualReturnPercent, inflationPercent) > OPTIMISTIC_REAL_RATE_PERCENT
}

/** R-3: nominal value, `months` from now, of an amount expressed in today's pesos. */
export function inflateToMonth(
  amountToday: number,
  months: number,
  inflationPercent: number
): number {
  if (inflationPercent === 0 || months <= 0) return amountToday
  return amountToday * (1 + monthlyRate(inflationPercent)) ** months
}

export interface ReachInputs {
  targetToday: number
  balance: number
  monthlyContrib: number
  annualReturnPercent: number
  inflationPercent: number
  maxMonths?: number
}

/**
 * R-4: first month whose projected balance is ≥ the inflation-adjusted target.
 * Returns 0 when already reached and null when unreachable within `maxMonths`.
 */
export function monthsToReach(inputs: ReachInputs): number | null {
  const { targetToday, balance, monthlyContrib, annualReturnPercent, inflationPercent } = inputs
  const maxMonths = inputs.maxMonths ?? MAX_PROJECTION_MONTHS
  if (balance >= targetToday) return 0

  // R-6: the neutral case keeps the historical closed form bit-for-bit, including
  // horizons beyond the simulation cap, so users without assumptions see no change.
  if (annualReturnPercent === 0 && inflationPercent === 0) {
    if (monthlyContrib <= 0) return null
    return Math.ceil((targetToday - balance) / monthlyContrib)
  }

  const rm = monthlyRate(annualReturnPercent)
  const growth = 1 + monthlyRate(inflationPercent)
  let projected = balance
  let target = targetToday
  for (let month = 1; month <= maxMonths; month++) {
    projected = projected * (1 + rm) + monthlyContrib
    target *= growth
    if (projected >= target - EPSILON) return month
  }
  return null
}

export interface RequiredMonthlyInputs {
  targetToday: number
  balance: number
  months: number
  annualReturnPercent: number
  inflationPercent: number
}

/**
 * Flat monthly contribution that reaches the inflation-adjusted target in `months`.
 * With no months left it is the whole remaining shortfall (EC-3). Never negative.
 */
export function requiredMonthlyFor(inputs: RequiredMonthlyInputs): number {
  const { targetToday, balance, months, annualReturnPercent, inflationPercent } = inputs
  if (months <= 0) return Math.max(0, targetToday - balance)

  const rm = monthlyRate(annualReturnPercent)
  const target = inflateToMonth(targetToday, months, inflationPercent)
  const balanceGrowth = (1 + rm) ** months
  const annuityFactor = rm === 0 ? months : (balanceGrowth - 1) / rm
  return Math.max(0, (target - balance * balanceGrowth) / annuityFactor)
}
