export interface Installment {
  total: number
  installments: number
  paid?: number
}

export interface CardWithInstallments {
  minPayment: number
  installmentsList: ReadonlyArray<Installment>
}

// Structural shape of a cardsStore item: cards carry installment plans, loans don't.
export type DebtObligationItem =
  | { type: 'card'; minPayment: number; installments: ReadonlyArray<Installment> }
  | { type: 'loan'; minPayment: number }

export function calcInstallmentMonthly(installment: Installment): number {
  if (installment.installments <= 0) return 0
  return installment.total / installment.installments
}

// A plan stops charging once every cuota has been paid.
export function isInstallmentActive(installment: Installment): boolean {
  return (installment.paid ?? 0) < installment.installments
}

export function calcCardObligation(card: CardWithInstallments): number {
  const installmentTotal = card.installmentsList
    .filter(isInstallmentActive)
    .reduce((acc, i) => acc + calcInstallmentMonthly(i), 0)
  return card.minPayment + installmentTotal
}

// Monthly debt obligation across all cards and loans — single source for DTI,
// disponible libre, projection and health score.
export function calcTotalDebtObligation(items: ReadonlyArray<DebtObligationItem>): number {
  return items.reduce((acc, d) => {
    if (d.type === 'card') {
      return (
        acc + calcCardObligation({ minPayment: d.minPayment, installmentsList: d.installments })
      )
    }
    return acc + d.minPayment
  }, 0)
}
