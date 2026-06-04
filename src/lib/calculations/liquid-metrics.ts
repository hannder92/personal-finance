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
