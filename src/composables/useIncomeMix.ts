import { computed, type ComputedRef } from 'vue'
import {
  calcIncomeMixByClass,
  type IncomeClass,
  type IncomeMixResult,
} from '@/lib/calculations/income-mix'
import { useIncomeStore } from '@/stores/incomeStore'
import { useNetIncome } from '@/composables/useNetIncome'

export interface UseIncomeMix {
  mix: ComputedRef<IncomeMixResult>
}

export function useIncomeMix(): UseIncomeMix {
  const income = useIncomeStore()
  const { netIncome } = useNetIncome()

  const mix = computed(() =>
    calcIncomeMixByClass({
      salaryNetMonthly: netIncome.value,
      streams: income.state.otherStreams.map((s) => ({
        amount: s.amount,
        frequency: s.frequency,
        incomeClass: (s.incomeClass ?? 'linear') as IncomeClass,
      })),
    })
  )

  return { mix }
}
