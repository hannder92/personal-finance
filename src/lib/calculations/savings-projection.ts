// Hypothetical and compound savings projections for US-8.
// Pure functions; no Vue/Pinia imports.

export interface HypotheticalSavingsInputs {
  netIncome: number
  savingsRatePercent: number
  monthsAhead: number
}

export interface HypotheticalSavingsPoint {
  month: number
  cumulativeAmount: number
}

export interface CompoundGrowthAsset {
  balance: number
  annualRatePercent: number
}

export interface CompoundGrowthPoint {
  month: number
  totalValue: number
}

// Linear accumulation: netIncome × rate% × (month + 1).
// Negative netIncome clamps to 0 — we never report a "negative savings" curve.
// monthsAhead === 0 returns [].
export function calcHypotheticalSavings(
  inputs: HypotheticalSavingsInputs
): HypotheticalSavingsPoint[] {
  const { netIncome, savingsRatePercent, monthsAhead } = inputs
  if (monthsAhead <= 0) return []
  const monthlySaved = Math.max(0, netIncome) * (savingsRatePercent / 100)
  const out: HypotheticalSavingsPoint[] = []
  for (let i = 0; i < monthsAhead; i++) {
    out.push({ month: i, cumulativeAmount: monthlySaved * (i + 1) })
  }
  return out
}

// Compound growth per asset using (1 + annualRatePercent/100)^(1/12) − 1 as monthly rate.
// Returns the SUMMED totalValue across all assets at each month.
// Empty assets array returns a flat zero series for monthsAhead months.
// monthsAhead === 0 returns [].
export function calcCompoundGrowth(
  assets: ReadonlyArray<CompoundGrowthAsset>,
  monthsAhead: number
): CompoundGrowthPoint[] {
  if (monthsAhead <= 0) return []
  // Pre-compute per-asset monthly rate to avoid recomputing inside the loop.
  const rates = assets.map((a) => Math.pow(1 + a.annualRatePercent / 100, 1 / 12) - 1)
  const out: CompoundGrowthPoint[] = []
  for (let i = 0; i < monthsAhead; i++) {
    // month index i means "i+1 months of growth applied".
    const monthsElapsed = i + 1
    let total = 0
    for (let j = 0; j < assets.length; j++) {
      total += assets[j]!.balance * Math.pow(1 + rates[j]!, monthsElapsed)
    }
    out.push({ month: i, totalValue: total })
  }
  return out
}

export interface ContributionGrowthInputs {
  startingBalance: number
  monthlyContribution: number
  annualRatePercent: number
  monthsAhead: number
}

export interface ContributionGrowthPoint {
  month: number
  /** Starting balance + contributions, no returns. */
  contributed: number
  /** Same contributions compounding at the annual rate (TEA). */
  withReturns: number
}

// One comparable pair of curves: both start from the same balance and receive the same
// monthly contribution; the gap between them is the return earned. Contributions are
// made at the end of each month.
export function calcContributionGrowth(
  inputs: ContributionGrowthInputs
): ContributionGrowthPoint[] {
  const { startingBalance, monthlyContribution, annualRatePercent, monthsAhead } = inputs
  if (monthsAhead <= 0) return []
  const base = Math.max(0, startingBalance)
  const contribution = Math.max(0, monthlyContribution)
  const rate = Math.pow(1 + Math.max(0, annualRatePercent) / 100, 1 / 12) - 1
  const out: ContributionGrowthPoint[] = []
  let contributed = base
  let withReturns = base
  for (let i = 0; i < monthsAhead; i++) {
    contributed += contribution
    withReturns = withReturns * (1 + rate) + contribution
    out.push({ month: i, contributed, withReturns })
  }
  return out
}
