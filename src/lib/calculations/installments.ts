export interface Installment {
  total: number
  installments: number
  paid?: number
}

export interface CardWithInstallments {
  minPayment: number
  installmentsList: ReadonlyArray<Installment>
}

// Monthly charge of a deferred purchase. Fully paid installments no longer add to the
// monthly obligation.
export function calcInstallmentMonthly(installment: Installment): number {
  if (installment.installments <= 0) return 0
  if ((installment.paid ?? 0) >= installment.installments) return 0
  return installment.total / installment.installments
}

export function calcCardObligation(card: CardWithInstallments): number {
  const installmentTotal = card.installmentsList.reduce(
    (acc, i) => acc + calcInstallmentMonthly(i),
    0
  )
  return card.minPayment + installmentTotal
}

export interface DebtObligationInput {
  type: 'card' | 'loan'
  minPayment: number
  installments?: ReadonlyArray<Installment>
}

// Total monthly debt obligation: card minimum + active deferred purchases, loan cuota.
export function calcTotalDebtObligation(debts: ReadonlyArray<DebtObligationInput>): number {
  return debts.reduce((acc, d) => {
    if (d.type === 'card') {
      return (
        acc +
        calcCardObligation({ minPayment: d.minPayment, installmentsList: d.installments ?? [] })
      )
    }
    return acc + d.minPayment
  }, 0)
}

export interface PayrollDebtInput {
  type: 'card' | 'loan'
  minPayment: number
  payrollDeducted?: boolean
}

// Libranza cuotas: withheld from the payslip, so they reduce the salary that reaches the
// account instead of being paid from it. They still count as debt for DTI.
export function calcPayrollDebtObligation(debts: ReadonlyArray<PayrollDebtInput>): number {
  return debts.reduce(
    (acc, d) => (d.type === 'loan' && d.payrollDeducted === true ? acc + d.minPayment : acc),
    0
  )
}

export interface DebtScheduleEntry {
  /** Monthly amount. */
  amount: number
  /** Months left including the current one; Infinity for an open-ended card minimum. */
  months: number
  /** Withheld from the payslip (libranza) instead of paid from the account. */
  payroll: boolean
}

export interface DebtScheduleInput {
  type: 'card' | 'loan'
  minPayment: number
  installments?: ReadonlyArray<Installment>
  remainingInstallments?: number
  payrollDeducted?: boolean
}

// Monthly debt payments with how long each one lasts, so a projection can stop charging
// a loan or a deferred purchase once its last cuota is paid.
export function calcDebtSchedule(debts: ReadonlyArray<DebtScheduleInput>): DebtScheduleEntry[] {
  const out: DebtScheduleEntry[] = []
  for (const d of debts) {
    if (d.type === 'card') {
      if (d.minPayment > 0) {
        out.push({ amount: d.minPayment, months: Number.POSITIVE_INFINITY, payroll: false })
      }
      for (const i of d.installments ?? []) {
        const left = i.installments - (i.paid ?? 0)
        const amount = calcInstallmentMonthly(i)
        if (left > 0 && amount > 0) out.push({ amount, months: left, payroll: false })
      }
      continue
    }
    if (d.minPayment <= 0) continue
    const n = d.remainingInstallments ?? 0
    out.push({
      amount: d.minPayment,
      months: n > 0 ? n : Number.POSITIVE_INFINITY,
      payroll: d.payrollDeducted === true,
    })
  }
  return out
}

// Sum of the schedule entries still running in projection month `index` (0 = this month).
export function debtDueInMonth(schedule: ReadonlyArray<DebtScheduleEntry>, index: number): number {
  return schedule.reduce((acc, e) => (index < e.months ? acc + e.amount : acc), 0)
}
