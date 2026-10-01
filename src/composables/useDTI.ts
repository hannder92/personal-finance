// Bridges cardsStore + useNetIncome to compute DTI as a percentage of total monthly income.
// Debt obligation includes active installment plans (calcTotalDebtObligation) per AC-4.2.

import { computed, type ComputedRef } from 'vue'
import { calcDTI } from '@/lib/calculations/dti'
import { useNetIncome } from './useNetIncome'

export interface UseDTI {
  dti: ComputedRef<number>
  totalDebtObligation: ComputedRef<number>
}

export function useDTI(): UseDTI {
  const { totalMonthlyIncome, debtObligationsTotal } = useNetIncome()

  const dti = computed(() => calcDTI(debtObligationsTotal.value, totalMonthlyIncome.value))

  return { dti, totalDebtObligation: debtObligationsTotal }
}
