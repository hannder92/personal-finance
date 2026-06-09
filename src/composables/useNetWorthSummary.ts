// Bridges assetsStore + cardsStore to the dashboard net worth cards (US-3).
// Same calculation the net worth view uses: assets total − debt balances.

import { computed, type ComputedRef } from 'vue'
import { calcNetWorth } from '@/lib/calculations/net-worth'
import { useAssetsStore } from '@/stores/assetsStore'
import { useCardsStore } from '@/stores/cardsStore'

export interface UseNetWorthSummary {
  assetsTotal: ComputedRef<number>
  liabilitiesTotal: ComputedRef<number>
  netWorth: ComputedRef<number>
  hasData: ComputedRef<boolean>
}

export function useNetWorthSummary(): UseNetWorthSummary {
  const assets = useAssetsStore()
  const cards = useCardsStore()

  const assetsTotal = computed(() => assets.state.items.reduce((acc, a) => acc + a.value, 0))
  const liabilitiesTotal = computed(() => cards.state.items.reduce((acc, c) => acc + c.balance, 0))
  const netWorth = computed(() => calcNetWorth(assets.state.items, cards.state.items))
  const hasData = computed(() => assets.state.items.length > 0 || cards.state.items.length > 0)

  return { assetsTotal, liabilitiesTotal, netWorth, hasData }
}
