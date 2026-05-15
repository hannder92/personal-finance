export interface Installment {
  total: number
  installments: number
  paid?: number
}

export interface CardWithInstallments {
  minPayment: number
  installmentsList: ReadonlyArray<Installment>
}

export function calcInstallmentMonthly(installment: Installment): number {
  if (installment.installments <= 0) return 0
  return installment.total / installment.installments
}

export function calcCardObligation(card: CardWithInstallments): number {
  const installmentTotal = card.installmentsList.reduce(
    (acc, i) => acc + calcInstallmentMonthly(i),
    0
  )
  return card.minPayment + installmentTotal
}
