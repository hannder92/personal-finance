import { computed, type ComputedRef } from 'vue'
import { calcProjection, type ProjectionMonth } from '@/lib/calculations/projection'
import { useNetIncome } from '@/composables/useNetIncome'
import { useIncomeStore } from '@/stores/incomeStore'

export interface UseCashFlowProjection {
  months: ComputedRef<ProjectionMonth[]>
  // Calendar month (0 = January) of projection month 0.
  startCalendarMonth: ComputedRef<number>
}

export function useCashFlowProjection(): UseCashFlowProjection {
  const income = useIncomeStore()
  const { netIncome, fixedExpensesTotal, variableBudgetTotal, debtObligationsTotal } =
    useNetIncome()

  // Not reactive to the clock: the dashboard re-mounts often enough for month changes.
  const startCalendarMonth = computed(() => new Date().getMonth())

  const months = computed(() => {
    const streams = income.state.otherStreams.map((s) => ({
      amount: s.amount,
      frequency: s.frequency,
      isPrima: s.isPrima === true,
    }))
    return calcProjection(
      {
        monthlyIncome: netIncome.value,
        streams,
        fixedExpenses: fixedExpensesTotal.value,
        debtObligation: debtObligationsTotal.value,
        variableExpenses: variableBudgetTotal.value,
        startCalendarMonth: startCalendarMonth.value,
      },
      12
    ).months
  })

  return { months, startCalendarMonth }
}
