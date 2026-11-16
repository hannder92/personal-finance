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
// Loans with a known number of remaining installments follow the bank schedule: the
// term is remainingInstallments and the interest is the French-amortization interest of
// that term at the loan's rate. Whatever the cuota has above that annuity is a non-interest
// charge (seguro de vida deudor, cuota de manejo…), so it is not reported as interest.
// When the cuota does not even reach the annuity, the schedule cannot hold and the loan is
// simulated with the cuota the user pays.
export function calcDebtTimeline(debt: Debt): DebtTimeline {
  const { balance, apr, minPayment } = debt
  if (debt.type === 'loan') {
    const n = debt.remainingInstallments
    const scheduled = n > 0 && minPayment > 0 && balance > 0
    const capitalCuota = scheduled ? scheduleCuota(balance, apr, n) : 0
    // Half a peso of tolerance absorbs bank rounding of the cuota.
    if (scheduled && minPayment + 0.5 >= capitalCuota) {
      return {
        type: 'loan',
        months: n,
        totalInterest: Math.max(0, Math.round(capitalCuota * n - balance)),
        remainingInstallments: n,
      }
    }
    return {
      type: 'loan',
      months: monthsToPayoff(balance, apr, minPayment),
      totalInterest: simulateInterest(balance, apr, minPayment),
      remainingInstallments: n,
    }
  }
  const months = monthsToPayoff(balance, apr, minPayment)
  return { type: 'card', months, totalInterest: simulateInterest(balance, apr, minPayment) }
}

// Capital + interest part of a loan cuota: French annuity for `n` months at the TEA rate.
export function scheduleCuota(balance: number, aprPercent: number, n: number): number {
  if (balance <= 0 || n <= 0) return 0
  const rate = monthlyRateFromTEA(aprPercent)
  if (rate === 0) return balance / n
  return (balance * rate) / (1 - Math.pow(1 + rate, -n))
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
