// Bridges incomeStore + expensesStore + cardsStore to the calcNetSalary lib function.
// Views consume `netIncome` / `freeForAllocation` from here — they MUST NOT import
// lib/calculations directly (per project architecture rules).

import { computed, type ComputedRef } from 'vue'
import { calcNetSalary } from '@/lib/calculations/net-income'
import { calcFreeForAllocation } from '@/lib/calculations/dti'
import { calcCardObligation } from '@/lib/calculations/installments'
import { useIncomeStore } from '@/stores/incomeStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useCardsStore } from '@/stores/cardsStore'

export interface UseNetIncome {
  netIncome: ComputedRef<number>
  freeForAllocation: ComputedRef<number>
}

export function useNetIncome(): UseNetIncome {
  const income = useIncomeStore()
  const expenses = useExpensesStore()
  const cards = useCardsStore()

  const netIncome = computed(() =>
    calcNetSalary({
      grossSalary: income.state.grossSalary,
      deductions: income.state.deductions,
      nonSalaryBenefits: income.state.nonSalaryBenefits,
    })
  )

  const fixedExpensesTotal = computed(() =>
    expenses.state.items.reduce((acc, e) => acc + e.amount, 0)
  )

  const debtObligationsTotal = computed(() =>
    cards.state.items.reduce((acc, c) => {
      if (c.type === 'card') {
        return acc + calcCardObligation({ minPayment: c.minPayment, installmentsList: c.installments })
      }
      return acc + c.minPayment
    }, 0)
  )

  const freeForAllocation = computed(() =>
    calcFreeForAllocation(netIncome.value, fixedExpensesTotal.value, debtObligationsTotal.value)
  )

  return { netIncome, freeForAllocation }
}
