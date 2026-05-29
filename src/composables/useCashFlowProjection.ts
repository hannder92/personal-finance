import { computed, type ComputedRef } from 'vue'
import { calcProjection, type ProjectionMonth } from '@/lib/calculations/projection'
import { calcCardObligation } from '@/lib/calculations/installments'
import { useNetIncome } from '@/composables/useNetIncome'
import { useCardsStore } from '@/stores/cardsStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useIncomeStore } from '@/stores/incomeStore'

export interface UseCashFlowProjection {
  months: ComputedRef<ProjectionMonth[]>
}

export function useCashFlowProjection(): UseCashFlowProjection {
  const income = useIncomeStore()
  const expenses = useExpensesStore()
  const cards = useCardsStore()
  const { netIncome } = useNetIncome()

  const months = computed(() => {
    const fixedExpenses = expenses.state.items.reduce((acc, e) => acc + e.amount, 0)
    const debtObligation = cards.state.items.reduce((acc, c) => {
      if (c.type === 'card') {
        return (
          acc + calcCardObligation({ minPayment: c.minPayment, installmentsList: c.installments })
        )
      }
      return acc + c.minPayment
    }, 0)
    const streams = income.state.otherStreams.map((s) => ({
      amount: s.amount,
      frequency: s.frequency,
    }))
    return calcProjection(
      {
        monthlyIncome: netIncome.value,
        streams,
        fixedExpenses,
        debtObligation,
      },
      12
    ).months
  })

  return { months }
}
