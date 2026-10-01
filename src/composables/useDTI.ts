// DTI = monthly debt obligations / gross monthly income (CFPB definition; the 36%
// warning threshold in lib/health/thresholds.ts is defined on gross income).
// Paid-off deferred installments do not count (calcInstallmentMonthly).

import { computed, type ComputedRef } from 'vue'
import { calcDTI } from '@/lib/calculations/dti'
import { useBaseMetrics } from './useBaseMetrics'

export interface UseDTI {
  dti: ComputedRef<number>
  totalDebtObligation: ComputedRef<number>
}

export function useDTI(): UseDTI {
  const { debtObligation, grossMonthlyIncome } = useBaseMetrics()
  const dti = computed(() => calcDTI(debtObligation.value, grossMonthlyIncome.value))
  return { dti, totalDebtObligation: debtObligation }
}
