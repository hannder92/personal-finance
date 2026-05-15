export interface DebtSortable {
  id: string
  apr: number
  balance: number
}

export function sortByAvalanche<T extends DebtSortable>(debts: ReadonlyArray<T>): T[] {
  return [...debts].sort((a, b) => b.apr - a.apr)
}

export function sortBySnowball<T extends DebtSortable>(debts: ReadonlyArray<T>): T[] {
  return [...debts].sort((a, b) => a.balance - b.balance)
}
