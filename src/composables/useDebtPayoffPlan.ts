import { computed, type ComputedRef } from 'vue'
import type { Debt as AmortDebt } from '@/lib/calculations/amortization'
import { calcDebtFreeOutlook, type DebtFreeOutlook } from '@/lib/calculations/dti'
import { calcDebtTimeline } from '@/lib/calculations/amortization'
import { sortByAvalanche, sortBySnowball } from '@/lib/calculations/payoff-strategy'
import { useCardsStore, type Debt } from '@/stores/cardsStore'
import { useSettingsStore } from '@/stores/settingsStore'

export interface UseDebtPayoffPlan {
  debtFreeDate: ComputedRef<Date | null>
  debtFreeOutlook: ComputedRef<DebtFreeOutlook>
  totalBalance: ComputedRef<number>
  /** Interest still to pay at the current payments; Infinity when a debt never ends. */
  totalInterest: ComputedRef<number>
  sortedDebtIds: ComputedRef<string[]>
}

function toAmortDebt(debt: Debt): AmortDebt {
  if (debt.type === 'loan') {
    return {
      type: 'loan',
      balance: debt.balance,
      apr: debt.apr,
      minPayment: debt.minPayment,
      remainingInstallments: debt.remainingInstallments,
    }
  }
  return {
    type: 'card',
    balance: debt.balance,
    apr: debt.apr,
    minPayment: debt.minPayment,
  }
}

export function useDebtPayoffPlan(): UseDebtPayoffPlan {
  const cards = useCardsStore()
  const settings = useSettingsStore()

  const sortable = computed(() =>
    cards.state.items.map((d) => ({ id: d.id, apr: d.apr, balance: d.balance }))
  )

  const sortedDebtIds = computed(() => {
    const sorted =
      settings.state.payoffMethod === 'snowball'
        ? sortBySnowball(sortable.value)
        : sortByAvalanche(sortable.value)
    return sorted.map((d) => d.id)
  })

  const debtFreeOutlook = computed(() =>
    calcDebtFreeOutlook(cards.state.items.map((d) => toAmortDebt(d)))
  )
  const debtFreeDate = computed(() =>
    debtFreeOutlook.value.kind === 'date' ? debtFreeOutlook.value.date : null
  )
  const totalBalance = computed(() => cards.state.items.reduce((acc, d) => acc + d.balance, 0))
  const totalInterest = computed(() =>
    cards.state.items.reduce((acc, d) => acc + calcDebtTimeline(toAmortDebt(d)).totalInterest, 0)
  )

  return {
    debtFreeDate,
    debtFreeOutlook,
    totalBalance,
    totalInterest,
    sortedDebtIds,
  }
}
