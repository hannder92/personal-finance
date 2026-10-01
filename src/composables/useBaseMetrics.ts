// Single source for the monthly figures every dashboard metric is built on.
// Income, debt, expenses and liquid assets are computed once here so the hero, DTI,
// health score, runway, projections and financial freedom never disagree.

import { computed, type ComputedRef } from 'vue'
import { calcNetSalary } from '@/lib/calculations/net-income'
import { calcMonthlyEquivalent } from '@/lib/calculations/frequency'
import { calcTotalDebtObligation } from '@/lib/calculations/installments'
import {
  calcLiquidAssetsTotal,
  calcMonthlyLivingExpense,
  calcMonthlyOutflow,
  calcVariableMonthly,
} from '@/lib/calculations/liquid-metrics'
import { calcRetencion } from '@/lib/tax/colombia/retencion'
import { useAssetsStore } from '@/stores/assetsStore'
import { useCardsStore } from '@/stores/cardsStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useIncomeStore } from '@/stores/incomeStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'

export interface UseBaseMetrics {
  /** Estimated monthly retención (COP only), whether or not it is applied. */
  retencionEstimate: ComputedRef<number>
  /** Retención actually subtracted from net income. */
  retencionApplied: ComputedRef<number>
  /** True when the user already entered a deduction labelled "retención". */
  hasManualRetencion: ComputedRef<boolean>
  /** Salary after deductions and retención, plus non-salary benefits. */
  netSalary: ComputedRef<number>
  /** Other income streams expressed per month (prima, freelance, rent…). */
  streamsMonthly: ComputedRef<number>
  /** Net monthly income: netSalary + streamsMonthly. */
  monthlyIncome: ComputedRef<number>
  /** Gross monthly income: salary + benefits + streams (base for DTI and housing ratio). */
  grossMonthlyIncome: ComputedRef<number>
  fixedExpenses: ComputedRef<number>
  variableMonthly: ComputedRef<number>
  debtObligation: ComputedRef<number>
  /** fixed + variable (no debt): cost of living used by financial freedom. */
  livingExpense: ComputedRef<number>
  /** fixed + variable + debt: what must be paid every month. */
  monthlyOutflow: ComputedRef<number>
  liquidAssets: ComputedRef<number>
  /** monthlyIncome − fixed − variable − debt. */
  freeForAllocation: ComputedRef<number>
}

export function useBaseMetrics(): UseBaseMetrics {
  const income = useIncomeStore()
  const expenses = useExpensesStore()
  const cards = useCardsStore()
  const variable = useVariableExpensesStore()
  const assets = useAssetsStore()
  const settings = useSettingsStore()

  const hasManualRetencion = computed(() =>
    income.state.deductions.some((d) => d.label.toLowerCase().includes('retenc'))
  )

  const retencionEstimate = computed(() =>
    settings.state.currency === 'COP' ? calcRetencion(income.state.grossSalary).amount : 0
  )

  const retencionApplied = computed(() =>
    settings.state.deductRetencion && !hasManualRetencion.value ? retencionEstimate.value : 0
  )

  const netSalary = computed(() => {
    const beforeTax = calcNetSalary({
      grossSalary: income.state.grossSalary,
      deductions: income.state.deductions,
      nonSalaryBenefits: income.state.nonSalaryBenefits,
    })
    return Math.max(0, beforeTax - retencionApplied.value)
  })

  const streamsMonthly = computed(() =>
    income.state.otherStreams.reduce((acc, s) => acc + calcMonthlyEquivalent(s), 0)
  )

  const monthlyIncome = computed(() => netSalary.value + streamsMonthly.value)

  const grossMonthlyIncome = computed(
    () =>
      income.state.grossSalary +
      income.state.nonSalaryBenefits.reduce((acc, b) => acc + b.amount, 0) +
      streamsMonthly.value
  )

  const fixedExpenses = computed(() => expenses.state.items.reduce((acc, e) => acc + e.amount, 0))
  const variableMonthly = computed(() => calcVariableMonthly(variable.state.items))
  const debtObligation = computed(() => calcTotalDebtObligation(cards.state.items))
  const livingExpense = computed(() =>
    calcMonthlyLivingExpense(fixedExpenses.value, variableMonthly.value)
  )
  const monthlyOutflow = computed(() =>
    calcMonthlyOutflow(fixedExpenses.value, variableMonthly.value, debtObligation.value)
  )
  const liquidAssets = computed(() => calcLiquidAssetsTotal(assets.state.items))
  const freeForAllocation = computed(() => monthlyIncome.value - monthlyOutflow.value)

  return {
    retencionEstimate,
    retencionApplied,
    hasManualRetencion,
    netSalary,
    streamsMonthly,
    monthlyIncome,
    grossMonthlyIncome,
    fixedExpenses,
    variableMonthly,
    debtObligation,
    livingExpense,
    monthlyOutflow,
    liquidAssets,
    freeForAllocation,
  }
}
