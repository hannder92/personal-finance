import { computed, type ComputedRef } from 'vue'
import { calcProjection, type ProjectionMonth } from '@/lib/calculations/projection'
import { PRIMA_PAYMENT_MONTHS } from '@/lib/calculations/frequency'
import { useBaseMetrics } from '@/composables/useBaseMetrics'
import { useIncomeStore } from '@/stores/incomeStore'

export interface UseCashFlowProjection {
  months: ComputedRef<ProjectionMonth[]>
  /** Calendar month (0 = January) of projection month 0. */
  startCalendarMonth: ComputedRef<number>
  startYear: ComputedRef<number>
}

export function useCashFlowProjection(): UseCashFlowProjection {
  const income = useIncomeStore()
  const { netSalary, fixedExpenses, debtObligation, variableMonthly } = useBaseMetrics()
  const now = new Date()
  const startCalendarMonth = computed(() => now.getMonth())
  const startYear = computed(() => now.getFullYear())

  const months = computed(() => {
    const streams = income.state.otherStreams.map((s) => ({
      amount: s.amount,
      frequency: s.frequency,
      // Prima de servicios is paid in June and December (Art. 306 CST).
      ...(s.isPrima ? { paymentMonths: PRIMA_PAYMENT_MONTHS } : {}),
    }))
    return calcProjection(
      {
        monthlyIncome: netSalary.value,
        streams,
        fixedExpenses: fixedExpenses.value,
        debtObligation: debtObligation.value,
        variableExpenses: variableMonthly.value,
        startCalendarMonth: startCalendarMonth.value,
      },
      12
    ).months
  })

  return { months, startCalendarMonth, startYear }
}
