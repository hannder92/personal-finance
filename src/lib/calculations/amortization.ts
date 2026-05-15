export interface CardDebt {
  type: 'card'
  balance: number
  apr: number // annual percentage rate as percent (e.g. 24 means 24%)
  minPayment: number
}

export interface LoanDebt {
  type: 'loan'
  balance: number
  apr: number
  minPayment: number
  remainingInstallments: number
}

export type Debt = CardDebt | LoanDebt

export interface DebtTimeline {
  type: 'card' | 'loan'
  months: number
  totalInterest: number
  remainingInstallments?: number
}

export interface ExtraPaymentImpact {
  monthsSaved: number
  interestSaved: number
}

// Returns months to pay off and total interest using standard fixed-payment amortization.
// For APR=0, falls back to simple division to avoid log(1+0)/log(1+0) = 0/0 NaN.
// For loans, preserves remainingInstallments on the result.
export function calcDebtTimeline(debt: Debt): DebtTimeline {
  const { balance, apr, minPayment } = debt
  const months = monthsToPayoff(balance, apr, minPayment)
  const totalInterest = Math.max(0, months * minPayment - balance)
  if (debt.type === 'loan') {
    return {
      type: 'loan',
      months,
      totalInterest,
      remainingInstallments: debt.remainingInstallments,
    }
  }
  return { type: 'card', months, totalInterest }
}

export function calcExtraPaymentImpact(card: CardDebt, extra: number): ExtraPaymentImpact {
  if (extra <= 0) return { monthsSaved: 0, interestSaved: 0 }
  const baseline = calcDebtTimeline(card)
  const withExtra = calcDebtTimeline({ ...card, minPayment: card.minPayment + extra })
  return {
    monthsSaved: Math.max(0, baseline.months - withExtra.months),
    interestSaved: Math.max(0, baseline.totalInterest - withExtra.totalInterest),
  }
}

function monthsToPayoff(balance: number, aprPercent: number, payment: number): number {
  if (balance <= 0 || payment <= 0) return 0
  if (aprPercent === 0) return Math.ceil(balance / payment)
  const monthlyRate = aprPercent / 100 / 12
  // If payment doesn't cover monthly interest the debt grows forever; clamp to a sentinel.
  if (payment <= balance * monthlyRate) return Number.POSITIVE_INFINITY
  const n = -Math.log(1 - (balance * monthlyRate) / payment) / Math.log(1 + monthlyRate)
  return Math.ceil(n)
}
