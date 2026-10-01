export type Frequency = 'monthly' | 'quarterly' | 'semiannual' | 'annual'

export interface FrequencyStream {
  amount: number
  frequency: Frequency
  // Prima de servicios: paid in June and December (Art. 306 CST), not from the current month.
  isPrima?: boolean
}

// Months between payments for each frequency.
const PERIOD_MONTHS: Readonly<Record<Frequency, number>> = {
  monthly: 1,
  quarterly: 3,
  semiannual: 6,
  annual: 12,
}

// Calendar months (0 = January) when the prima de servicios is paid.
export const PRIMA_CALENDAR_MONTHS: ReadonlyArray<number> = [5, 11]

export function calcMonthlyEquivalent(stream: FrequencyStream): number {
  return stream.amount / PERIOD_MONTHS[stream.frequency]
}

// Returns the indices (relative to startMonth=0) where the stream is actually received,
// within a projection window of `count` months. e.g. a quarterly stream from month 0 over
// 12 months yields [0, 3, 6, 9] — paid every 3 months.
// When `startCalendarMonth` (0 = January) is given, a prima stream lands on June and
// December instead of following the generic cadence.
export function getProjectionMonthsForStream(
  stream: FrequencyStream,
  startMonth: number,
  count: number,
  startCalendarMonth?: number
): number[] {
  const result: number[] = []
  if (stream.isPrima === true && startCalendarMonth !== undefined) {
    for (let i = startMonth; i < count; i++) {
      if (PRIMA_CALENDAR_MONTHS.includes((startCalendarMonth + i) % 12)) result.push(i)
    }
    return result
  }
  const period = PERIOD_MONTHS[stream.frequency]
  for (let i = 0; i < count; i++) {
    if ((i - startMonth) % period === 0 && i >= startMonth) {
      result.push(i)
    }
  }
  return result
}
