// Determines whether to show an empty-state CTA on the dashboard and which
// section is the highest-priority missing data. Reactive on incomeStore and
// expensesStore.

import { computed, type ComputedRef } from 'vue'
import { useIncomeStore } from '@/stores/incomeStore'
import { useExpensesStore } from '@/stores/expensesStore'

export type DashboardCtaTarget = '' | 'income' | 'expenses'

export interface DashboardGuide {
  shouldShow: ComputedRef<boolean>
  ctaTarget: ComputedRef<DashboardCtaTarget>
  ctaLabel: ComputedRef<string>
  hasCalculableIncome: ComputedRef<boolean>
}

const CTA_LABEL: Record<DashboardCtaTarget, string> = {
  '': '',
  income: 'Registrar ingreso',
  expenses: 'Registrar gasto fijo',
}

export function useDashboardGuide(): DashboardGuide {
  const income = useIncomeStore()
  const expenses = useExpensesStore()

  const hasCalculableIncome = computed(() => income.state.grossSalary > 0)
  const hasExpenses = computed(() => expenses.state.items.length > 0)

  const ctaTarget = computed<DashboardCtaTarget>(() => {
    if (!hasCalculableIncome.value) return 'income'
    if (!hasExpenses.value) return 'expenses'
    return ''
  })

  const shouldShow = computed(() => ctaTarget.value !== '')
  const ctaLabel = computed(() => CTA_LABEL[ctaTarget.value])

  return { shouldShow, ctaTarget, ctaLabel, hasCalculableIncome }
}
