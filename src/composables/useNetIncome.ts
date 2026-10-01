// Single source for the monthly base the dashboard reads: income (net salary + prorated
// other streams), fixed/variable spending and debt obligations. Views consume these
// from here — they MUST NOT import lib/calculations directly (per project architecture rules).

import { computed, type ComputedRef } from 'vue'
import { calcNetSalary } from '@/lib/calculations/net-income'
import { calcFreeForAllocation } from '@/lib/calculations/dti'
import { calcMonthlyEquivalent } from '@/lib/calculations/frequency'
import { calcTotalDebtObligation } from '@/lib/calculations/installments'
import { useIncomeStore } from '@/stores/incomeStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useCardsStore } from '@/stores/cardsStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'

export interface UseNetIncome {
  // Net salary only (gross − deductions + non-salary benefits).
  netIncome: ComputedRef<number>
  // Other streams (prima, arriendos…) converted to their monthly equivalent.
  otherStreamsMonthly: ComputedRef<number>
  // netIncome + otherStreamsMonthly — the base for DTI, ratios and allocation.
  totalMonthlyIncome: ComputedRef<number>
  fixedExpensesTotal: ComputedRef<number>
  // Sum of monthly variable budgets (planned spend, independent of how much was spent so far).
  variableBudgetTotal: ComputedRef<number>
  debtObligationsTotal: ComputedRef<number>
  freeForAllocation: ComputedRef<number>
}

export function useNetIncome(): UseNetIncome {
  const income = useIncomeStore()
  const expenses = useExpensesStore()
  const cards = useCardsStore()
  const variable = useVariableExpensesStore()

  const netIncome = computed(() =>
    calcNetSalary({
      grossSalary: income.state.grossSalary,
      deductions: income.state.deductions,
      nonSalaryBenefits: income.state.nonSalaryBenefits,
    })
  )

  const otherStreamsMonthly = computed(() =>
    income.state.otherStreams.reduce((acc, s) => acc + calcMonthlyEquivalent(s), 0)
  )

  const totalMonthlyIncome = computed(() => netIncome.value + otherStreamsMonthly.value)

  const fixedExpensesTotal = computed(() =>
    expenses.state.items.reduce((acc, e) => acc + e.amount, 0)
  )

  const variableBudgetTotal = computed(() =>
    variable.state.items.reduce((acc, v) => acc + v.budget, 0)
  )

  const debtObligationsTotal = computed(() => calcTotalDebtObligation(cards.state.items))

  const freeForAllocation = computed(() =>
    calcFreeForAllocation(
      totalMonthlyIncome.value,
      fixedExpensesTotal.value,
      debtObligationsTotal.value,
      variableBudgetTotal.value
    )
  )

  return {
    netIncome,
    otherStreamsMonthly,
    totalMonthlyIncome,
    fixedExpensesTotal,
    variableBudgetTotal,
    debtObligationsTotal,
    freeForAllocation,
  }
}
