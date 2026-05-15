export interface ExpenseInput {
  amount: number
  category: string
}

// Housing ratio = sum(housing-category expenses) / totalIncome × 100.
// Used by AC-4.3 to feed the health-score housing component and dashboard ratio.
export function calcHousingRatio(
  expenses: ReadonlyArray<ExpenseInput>,
  totalIncome: number
): number {
  if (totalIncome <= 0) return 0
  const housingTotal = expenses
    .filter((e) => e.category === 'housing')
    .reduce((acc, e) => acc + e.amount, 0)
  return (housingTotal / totalIncome) * 100
}
