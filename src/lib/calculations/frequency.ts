export type Frequency = 'monthly' | 'quarterly' | 'semiannual' | 'annual'

export interface FrequencyStream {
  amount: number
  frequency: Frequency
  /**
   * Calendar months (0 = January) in which the stream is paid. When set, the
   * projection places payments on those months instead of starting at month 0.
   * Prima de servicios is paid in June and December (Art. 306 CST).
   */
  paymentMonths?: ReadonlyArray<number>
}

export const PRIMA_PAYMENT_MONTHS: ReadonlyArray<number> = [5, 11]

// Months between payments for each frequency.
const PERIOD_MONTHS: Readonly<Record<Frequency, number>> = {
  monthly: 1,
  quarterly: 3,
  semiannual: 6,
  annual: 12,
}

export function calcMonthlyEquivalent(stream: FrequencyStream): number {
  return stream.amount / PERIOD_MONTHS[stream.frequency]
}

// Returns the indices (relative to startMonth=0) where the stream is actually received,
// within a projection window of `count` months. e.g. a quarterly stream from month 0 over
// 12 months yields [0, 3, 6, 9] — paid every 3 months.
export function getProjectionMonthsForStream(
  stream: FrequencyStream,
  startMonth: number,
  count: number,
  startCalendarMonth = 0
): number[] {
  if (stream.paymentMonths && stream.paymentMonths.length > 0) {
    const paid = new Set(stream.paymentMonths)
    const hits: number[] = []
    for (let i = startMonth; i < count; i++) {
      if (paid.has((startCalendarMonth + i) % 12)) hits.push(i)
    }
    return hits
  }
  const period = PERIOD_MONTHS[stream.frequency]
  const result: number[] = []
  for (let i = 0; i < count; i++) {
    if ((i - startMonth) % period === 0 && i >= startMonth) {
      result.push(i)
    }
  }
  return result
}
