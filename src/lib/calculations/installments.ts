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
