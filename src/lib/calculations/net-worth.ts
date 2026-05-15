export interface AssetInput {
  value: number
}

export interface CardLiability {
  balance: number
}

export function calcNetWorth(
  assets: ReadonlyArray<AssetInput>,
  cards: ReadonlyArray<CardLiability>
): number {
  const assetsTotal = assets.reduce((acc, a) => acc + a.value, 0)
  const liabilitiesTotal = cards.reduce((acc, c) => acc + c.balance, 0)
  return assetsTotal - liabilitiesTotal
}
