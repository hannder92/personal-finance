// Multi-debt prepayment simulator (abonos a capital). Pure month-by-month simulation:
// every debt accrues interest at its TEA-equivalent monthly rate, pays its cuota, and
// the extra money (monthly extra + recurring lump sums) goes to one target debt at a
// time in avalanche or snowball order.

import { sortByAvalanche, sortBySnowball } from './payoff-strategy'

export type PrepaymentMode = 'term' | 'payment'
export type PayoffOrder = 'avalanche' | 'snowball'

export interface PrepaymentDebt {
  id: string
  balance: number
  /** TEA as percent (Superfinanciera convention). */
  apr: number
  /** Monthly cuota (card: minimum + active deferred installments). */
  payment: number
  /** Remaining installments for loans; 0/undefined when the term is open (cards). */
  remainingInstallments?: number
}

export interface LumpSum {
  /** 0 = January … 11 = December; repeats every year. */
  calendarMonth: number
  amount: number
}

export interface PrepaymentPlanInput {
  debts: ReadonlyArray<PrepaymentDebt>
  extraMonthly: number
  lumpSums: ReadonlyArray<LumpSum>
  order: PayoffOrder
  /**
   * term: keep the cuota and shorten the loan; a finished debt's cuota rolls over to the
   * next target. payment: keep the term and recalculate the cuota after each abono; the
   * freed cuota stays with the user.
   */
  mode: PrepaymentMode
  /** Calendar month (0–11) of simulation month 1. */
  startCalendarMonth: number
}

export interface DebtPayoff {
  id: string
  /** Simulation month (1-based) of the last payment; Infinity when it never ends. */
  months: number
  interest: number
}

export interface PrepaymentScenario {
  /** Month of the last payment across all debts; Infinity when one never ends. */
  months: number
  totalInterest: number
  perDebt: DebtPayoff[]
  /** Sum of scheduled cuotas due in each simulated month (index 0 = month 1). */
  cuotaByMonth: number[]
}

export interface PrepaymentComparison {
  baseline: PrepaymentScenario
  plan: PrepaymentScenario
  monthsSaved: number
  interestSaved: number
  /** Debt ids in the order the extra money is applied. */
  order: string[]
}

// 50 years: past this the cuota does not cover the interest and the debt never ends.
export const MAX_SIMULATION_MONTHS = 600

function monthlyRate(aprPercent: number): number {
  // TEA → monthly effective rate, (1 + TEA)^(1/12) − 1 (Superfinanciera; see ADR-1).
  return Math.pow(1 + aprPercent / 100, 1 / 12) - 1
}

// French amortization cuota for `n` remaining months.
function annuity(balance: number, rate: number, n: number): number {
  if (n <= 0) return balance
  if (rate === 0) return balance / n
  return (balance * rate) / (1 - Math.pow(1 + rate, -n))
}

interface DebtState {
  id: string
  balance: number
  rate: number
  cuota: number
  originalCuota: number
  termLeft: number
  interest: number
  doneMonth: number
}

function sanitize(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0
}

export function sortDebtIds(debts: ReadonlyArray<PrepaymentDebt>, order: PayoffOrder): string[] {
  const sortable = debts
    .filter((d) => d.balance > 0)
    .map((d) => ({ id: d.id, apr: d.apr, balance: d.balance }))
  const sorted = order === 'snowball' ? sortBySnowball(sortable) : sortByAvalanche(sortable)
  return sorted.map((d) => d.id)
}

export function simulatePrepaymentPlan(input: PrepaymentPlanInput): PrepaymentScenario {
  const order = sortDebtIds(input.debts, input.order)
  const states: DebtState[] = input.debts
    .filter((d) => d.balance > 0)
    .map((d) => ({
      id: d.id,
      balance: d.balance,
      rate: monthlyRate(sanitize(d.apr)),
      cuota: sanitize(d.payment),
      originalCuota: sanitize(d.payment),
      termLeft: Math.max(0, Math.floor(d.remainingInstallments ?? 0)),
      interest: 0,
      doneMonth: 0,
    }))
  const byId = new Map(states.map((s) => [s.id, s]))
  const extraMonthly = sanitize(input.extraMonthly)
  const rollover = input.mode === 'term'
  const totalOriginalCuota = states.reduce((acc, s) => acc + s.originalCuota, 0)
  const cuotaByMonth: number[] = []

  for (let month = 1; month <= MAX_SIMULATION_MONTHS; month++) {
    const active = states.filter((s) => s.doneMonth === 0)
    if (active.length === 0) break

    const calendarMonth = (input.startCalendarMonth + month - 1) % 12
    const lump = input.lumpSums
      .filter((l) => l.calendarMonth === calendarMonth)
      .reduce((acc, l) => acc + sanitize(l.amount), 0)

    cuotaByMonth.push(active.reduce((acc, s) => acc + s.cuota, 0))

    let scheduledPaid = 0
    for (const s of active) {
      const interest = s.balance * s.rate
      s.interest += interest
      s.balance += interest
      const pay = Math.min(s.cuota, s.balance)
      s.balance -= pay
      scheduledPaid += pay
      if (s.termLeft > 0) s.termLeft -= 1
    }

    // In term mode the whole original cuota budget stays committed to debt, so a
    // finished (or partially paid) debt's cuota rolls over to the next target.
    let pool = extraMonthly + lump + (rollover ? totalOriginalCuota - scheduledPaid : 0)
    for (const id of order) {
      if (pool <= 0) break
      const s = byId.get(id)
      if (!s || s.balance <= 0) continue
      const pay = Math.min(pool, s.balance)
      s.balance -= pay
      pool -= pay
      if (!rollover && s.balance > 0 && s.termLeft > 0) {
        s.cuota = annuity(s.balance, s.rate, s.termLeft)
      }
    }

    for (const s of active) {
      // Sub-peso residue from floating point is treated as paid.
      if (s.balance < 0.5) {
        s.balance = 0
        s.doneMonth = month
      }
    }
  }

  const perDebt: DebtPayoff[] = states.map((s) => ({
    id: s.id,
    months: s.doneMonth > 0 ? s.doneMonth : Number.POSITIVE_INFINITY,
    interest: s.doneMonth > 0 ? Math.round(s.interest) : Number.POSITIVE_INFINITY,
  }))
  const months = perDebt.reduce((acc, d) => Math.max(acc, d.months), 0)
  const totalInterest = perDebt.reduce((acc, d) => acc + d.interest, 0)
  return { months, totalInterest, perDebt, cuotaByMonth }
}

// Plan vs paying only the cuotas (no extra, no lump sums, no rollover).
export function comparePrepaymentPlan(input: PrepaymentPlanInput): PrepaymentComparison {
  const baseline = simulatePrepaymentPlan({
    ...input,
    extraMonthly: 0,
    lumpSums: [],
    mode: 'payment',
  })
  const plan = simulatePrepaymentPlan(input)
  const finite = Number.isFinite(baseline.months) && Number.isFinite(plan.months)
  return {
    baseline,
    plan,
    monthsSaved: finite ? Math.max(0, baseline.months - plan.months) : 0,
    interestSaved:
      Number.isFinite(baseline.totalInterest) && Number.isFinite(plan.totalInterest)
        ? Math.max(0, baseline.totalInterest - plan.totalInterest)
        : 0,
    order: sortDebtIds(input.debts, input.order),
  }
}
