import { computed, type ComputedRef } from 'vue'
import type { Debt as AmortDebt } from '@/lib/calculations/amortization'
import { calcExtraPaymentImpact, type CardDebt as AmortCard } from '@/lib/calculations/amortization'
import { calcDebtFreeDate } from '@/lib/calculations/dti'
import { sortByAvalanche, sortBySnowball } from '@/lib/calculations/payoff-strategy'
import { useCardsStore, type CardDebt, type Debt } from '@/stores/cardsStore'
import { useSettingsStore } from '@/stores/settingsStore'

export interface DebtPayoffSimulatorResult {
  monthsSaved: number
  interestSaved: number
}

export interface UseDebtPayoffPlan {
  debtFreeDate: ComputedRef<Date | null>
  sortedDebtIds: ComputedRef<string[]>
  simulateExtraPayment: (debtId: string, extraPayment: number) => DebtPayoffSimulatorResult
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

function toAmortCard(debt: CardDebt): AmortCard {
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

  const debtFreeDate = computed(() =>
    calcDebtFreeDate(cards.state.items.map((d) => toAmortDebt(d)))
  )

  function simulateExtraPayment(debtId: string, extraPayment: number): DebtPayoffSimulatorResult {
    const debt = cards.state.items.find((d) => d.id === debtId)
    if (!debt || debt.type !== 'card') {
      return { monthsSaved: 0, interestSaved: 0 }
    }
    return calcExtraPaymentImpact(toAmortCard(debt), extraPayment)
  }

  return { debtFreeDate, sortedDebtIds, simulateExtraPayment }
}
