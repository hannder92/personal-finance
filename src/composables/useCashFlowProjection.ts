import { computed, type ComputedRef } from 'vue'
import { calcProjection, type ProjectionMonth } from '@/lib/calculations/projection'
import { PRIMA_PAYMENT_MONTHS } from '@/lib/calculations/frequency'
import { calcDebtSchedule, debtDueInMonth } from '@/lib/calculations/installments'
import { useCardsStore } from '@/stores/cardsStore'
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
  const cards = useCardsStore()
  const { netSalary, fixedExpenses, cashDebtObligation, variableMonthly, payrollDeductionApplied } =
    useBaseMetrics()
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
    const schedule = calcDebtSchedule(cards.state.items)
    // netSalary already has the libranzas withheld. Project from the salary before them and
    // charge each libranza while it lasts, so the salary goes back up after the last cuota.
    // A libranza typed as a manual deduction stays inside netSalary (applied = 0).
    const withholdsLibranza = payrollDeductionApplied.value > 0
    const debtForMonth = (i: number) =>
      debtDueInMonth(
        schedule.filter((e) => !e.payroll || withholdsLibranza),
        i
      )
    return calcProjection(
      {
        monthlyIncome: netSalary.value + payrollDeductionApplied.value,
        streams,
        fixedExpenses: fixedExpenses.value,
        // Flat fallback only; debtForMonth takes precedence.
        debtObligation: cashDebtObligation.value,
        debtForMonth,
        variableExpenses: variableMonthly.value,
        startCalendarMonth: startCalendarMonth.value,
      },
      12
    ).months
  })

  return { months, startCalendarMonth, startYear }
}
