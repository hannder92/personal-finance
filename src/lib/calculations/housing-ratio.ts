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
  // Accept both 'housing' (legacy English) and 'vivienda' (current UI default).
  const housingTotal = expenses
    .filter((e) => e.category === 'housing' || e.category === 'vivienda')
    .reduce((acc, e) => acc + e.amount, 0)
  return (housingTotal / totalIncome) * 100
}
