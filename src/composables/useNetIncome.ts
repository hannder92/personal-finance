// Thin facade over useBaseMetrics kept for existing consumers.
// Views consume `netIncome` / `freeForAllocation` from here — they MUST NOT import
// lib/calculations directly (per project architecture rules).

import type { ComputedRef } from 'vue'
import { useBaseMetrics } from './useBaseMetrics'

export interface UseNetIncome {
  /** Net monthly income: salary after deductions/retención + prorated other streams. */
  netIncome: ComputedRef<number>
  /** Salary-only net (no other streams); used where streams are placed month by month. */
  netSalary: ComputedRef<number>
  /** netIncome − fixed − variable − debt obligations. */
  freeForAllocation: ComputedRef<number>
}

export function useNetIncome(): UseNetIncome {
  const { monthlyIncome, netSalary, freeForAllocation } = useBaseMetrics()
  return { netIncome: monthlyIncome, netSalary, freeForAllocation }
}
