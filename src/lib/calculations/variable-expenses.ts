export type SpendingStatus = 'green' | 'amber' | 'red'

export interface VariableCategorySpending {
  budget: number
  spent: number
}

// Thresholds per AC-8.1: 0-80% → green; 80-100% → amber; ≥100% → red.
export function calcSpendingStatus(category: VariableCategorySpending): SpendingStatus {
  if (category.budget <= 0) return category.spent > 0 ? 'red' : 'green'
  const ratio = category.spent / category.budget
  if (ratio >= 1) return 'red'
  if (ratio >= 0.8) return 'amber'
  return 'green'
}
