export const LIQUID_ASSET_TYPES = ['cash', 'savings', 'investment'] as const

export type LiquidAssetType = (typeof LIQUID_ASSET_TYPES)[number]

export function calcLiquidAssetsTotal(
  assets: ReadonlyArray<{ type: string; value: number }>
): number {
  const liquid = new Set<string>(LIQUID_ASSET_TYPES)
  return assets.filter((a) => liquid.has(a.type)).reduce((acc, a) => acc + a.value, 0)
}

export function calcMonthlyLivingExpense(fixedTotal: number, variableSpentTotal: number): number {
  return fixedTotal + variableSpentTotal
}

// Monthly cost of a variable category: the budget, or what was actually spent when the
// budget was exceeded.
export function calcVariableMonthly(
  categories: ReadonlyArray<{ budget: number; spent: number }>
): number {
  return categories.reduce((acc, c) => acc + Math.max(c.budget, c.spent), 0)
}

// Everything that leaves the account each month: fixed + variable + minimum debt payments.
// Used by the emergency fund and runway so both show the same coverage.
export function calcMonthlyOutflow(fixed: number, variable: number, debt: number): number {
  return fixed + variable + debt
}
