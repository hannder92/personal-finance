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

// Returns months to pay off and total interest using fixed-payment amortization.
// Cards: simulated month by month so the last (partial) payment is not overcharged.
// Loans with a known number of remaining installments follow the bank schedule:
// months = remainingInstallments, interest = cuotas pagadas − saldo.
export function calcDebtTimeline(debt: Debt): DebtTimeline {
  const { balance, apr, minPayment } = debt
  if (debt.type === 'loan') {
    const scheduled = debt.remainingInstallments > 0 && minPayment > 0 && balance > 0
    const months = scheduled ? debt.remainingInstallments : monthsToPayoff(balance, apr, minPayment)
    const totalInterest = scheduled
      ? Math.max(0, months * minPayment - balance)
      : simulateInterest(balance, apr, minPayment)
    return {
      type: 'loan',
      months,
      totalInterest,
      remainingInstallments: debt.remainingInstallments,
    }
  }
  const months = monthsToPayoff(balance, apr, minPayment)
  return { type: 'card', months, totalInterest: simulateInterest(balance, apr, minPayment) }
}

function monthlyRateFromTEA(aprPercent: number): number {
  // APR is interpreted as TEA (Tasa Efectiva Anual) per Superfinanciera convention,
  // so the equivalent monthly rate is (1 + TEA)^(1/12) − 1, NOT TEA/12. See ADR-1.
  return Math.pow(1 + aprPercent / 100, 1 / 12) - 1
}

// Total interest paid until the balance reaches zero; Infinity when the payment never
// covers the monthly interest.
function simulateInterest(balance: number, aprPercent: number, payment: number): number {
  if (balance <= 0 || payment <= 0) return 0
  const rate = monthlyRateFromTEA(aprPercent)
  if (payment <= balance * rate) return Number.POSITIVE_INFINITY
  let remaining = balance
  let interest = 0
  // Bounded loop: payment > first month's interest guarantees payoff; 1200 months is a guard.
  for (let i = 0; i < 1200 && remaining > 0; i++) {
    const monthInterest = remaining * rate
    interest += monthInterest
    remaining = remaining + monthInterest - payment
  }
  return Math.round(interest)
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
  const monthlyRate = monthlyRateFromTEA(aprPercent)
  if (payment <= balance * monthlyRate) return Number.POSITIVE_INFINITY
  const n = -Math.log(1 - (balance * monthlyRate) / payment) / Math.log(1 + monthlyRate)
  return Math.ceil(n)
}
