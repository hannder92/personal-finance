import { getProjectionMonthsForStream, type FrequencyStream } from './frequency'

export interface ProjectionInputs {
  monthlyIncome: number
  streams: ReadonlyArray<FrequencyStream>
  fixedExpenses: number
  debtObligation: number
}

export interface ProjectionMonth {
  month: number
  projectedBalance: number
}

export interface ProjectionResult {
  months: ProjectionMonth[]
  negativeMonths: number[]
}

// Cumulative balance over `monthsAhead` months. Monthly income arrives every month;
// non-monthly streams are credited only on the months returned by getProjectionMonthsForStream.
export function calcProjection(inputs: ProjectionInputs, monthsAhead: number): ProjectionResult {
  const { monthlyIncome, streams, fixedExpenses, debtObligation } = inputs

  // Pre-compute which months each non-monthly stream hits.
  const streamHits = streams.map((s) => ({
    stream: s,
    months: new Set(getProjectionMonthsForStream(s, 0, monthsAhead)),
  }))

  const months: ProjectionMonth[] = []
  const negativeMonths: number[] = []
  let cumulative = 0

  for (let i = 0; i < monthsAhead; i++) {
    let monthIncome = monthlyIncome
    for (const { stream, months: hitSet } of streamHits) {
      if (hitSet.has(i)) monthIncome += stream.amount
    }
    cumulative += monthIncome - fixedExpenses - debtObligation
    months.push({ month: i, projectedBalance: cumulative })
    if (cumulative < 0) negativeMonths.push(i)
  }

  return { months, negativeMonths }
}
