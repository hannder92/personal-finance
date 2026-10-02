// Bridges cards/income/settings stores to the prepayment simulator (abonos a capital).

import { computed, type ComputedRef, type Ref } from 'vue'
import { calcCardObligation } from '@/lib/calculations/installments'
import {
  comparePrepaymentPlan,
  type LumpSum,
  type PayoffOrder,
  type PrepaymentComparison,
  type PrepaymentDebt,
  type PrepaymentMode,
} from '@/lib/calculations/prepayment'
import { PRIMA_PAYMENT_MONTHS } from '@/lib/calculations/frequency'
import { calcInteresesCesantias } from '@/lib/tax/colombia/cesantias'
import { calcPrimaServicios } from '@/lib/tax/colombia/prima'
import { useBaseMetrics } from './useBaseMetrics'
import { useCardsStore } from '@/stores/cardsStore'
import { useIncomeStore } from '@/stores/incomeStore'
import { useSettingsStore } from '@/stores/settingsStore'

export interface PrepaymentInputs {
  extraMonthly: Ref<number>
  /** Abono with each prima de servicios (June and December). */
  primaAbono: Ref<number>
  /** Abono with the intereses de cesantías (January). */
  cesantiasInterestAbono: Ref<number>
  mode: Ref<PrepaymentMode>
}

export interface PrepaymentDebtRow {
  id: string
  name: string
  baselineDate: Date | null
  planDate: Date | null
}

export interface UsePrepaymentPlan {
  order: ComputedRef<PayoffOrder>
  setOrder: (order: PayoffOrder) => void
  comparison: ComputedRef<PrepaymentComparison>
  baselineDate: ComputedRef<Date | null>
  planDate: ComputedRef<Date | null>
  /** Debts in the order the extra money goes, with their payoff dates. */
  rows: ComputedRef<PrepaymentDebtRow[]>
  /** Total cuota this month and 12 months from now under the plan. */
  cuotaNow: ComputedRef<number>
  cuotaInAYear: ComputedRef<number>
  freeForAllocation: ComputedRef<number>
  suggestedPrima: ComputedRef<number>
  suggestedCesantiasInterest: ComputedRef<number>
  hasDebts: ComputedRef<boolean>
}

// Intereses de cesantías are paid by January 31 (Ley 52/1975, Art. 1).
const CESANTIAS_INTEREST_MONTH = 0

export function usePrepaymentPlan(
  inputs: PrepaymentInputs,
  now: Date = new Date()
): UsePrepaymentPlan {
  const cards = useCardsStore()
  const income = useIncomeStore()
  const settings = useSettingsStore()
  const { freeForAllocation } = useBaseMetrics()

  const order = computed<PayoffOrder>(() => settings.state.payoffMethod)
  function setOrder(next: PayoffOrder): void {
    settings.setPayoffMethod(next)
  }

  const debts = computed<PrepaymentDebt[]>(() =>
    cards.state.items.map((d) =>
      d.type === 'card'
        ? {
            id: d.id,
            balance: d.balance,
            apr: d.apr,
            payment: calcCardObligation({
              minPayment: d.minPayment,
              installmentsList: d.installments,
            }),
          }
        : {
            id: d.id,
            balance: d.balance,
            apr: d.apr,
            payment: d.minPayment,
            remainingInstallments: d.remainingInstallments,
          }
    )
  )

  const lumpSums = computed<LumpSum[]>(() => [
    ...PRIMA_PAYMENT_MONTHS.map((calendarMonth) => ({
      calendarMonth,
      amount: inputs.primaAbono.value,
    })),
    { calendarMonth: CESANTIAS_INTEREST_MONTH, amount: inputs.cesantiasInterestAbono.value },
  ])

  const comparison = computed(() =>
    comparePrepaymentPlan({
      debts: debts.value,
      extraMonthly: inputs.extraMonthly.value,
      lumpSums: lumpSums.value,
      order: order.value,
      mode: inputs.mode.value,
      startCalendarMonth: now.getMonth(),
    })
  )

  // Simulation month 1 is the current month.
  function monthDate(months: number): Date | null {
    if (!Number.isFinite(months) || months <= 0) return null
    return new Date(now.getFullYear(), now.getMonth() + months - 1, 1)
  }

  const baselineDate = computed(() => monthDate(comparison.value.baseline.months))
  const planDate = computed(() => monthDate(comparison.value.plan.months))

  const rows = computed<PrepaymentDebtRow[]>(() =>
    comparison.value.order.map((id) => {
      const debt = cards.state.items.find((d) => d.id === id)
      const months = (scenario: PrepaymentComparison['plan']) =>
        scenario.perDebt.find((p) => p.id === id)?.months ?? 0
      return {
        id,
        name: debt?.name ?? '',
        baselineDate: monthDate(months(comparison.value.baseline)),
        planDate: monthDate(months(comparison.value.plan)),
      }
    })
  )

  const cuotaNow = computed(() => comparison.value.plan.cuotaByMonth[0] ?? 0)
  const cuotaInAYear = computed(() => comparison.value.plan.cuotaByMonth[12] ?? 0)

  const suggestedPrima = computed(() => {
    const stream = income.state.otherStreams.find((s) => s.isPrima)
    if (stream) return stream.amount
    return calcPrimaServicios(income.state.grossSalary).amount
  })
  const suggestedCesantiasInterest = computed(() =>
    calcInteresesCesantias(income.state.grossSalary)
  )

  const hasDebts = computed(() => debts.value.some((d) => d.balance > 0))

  return {
    order,
    setOrder,
    comparison,
    baselineDate,
    planDate,
    rows,
    cuotaNow,
    cuotaInAYear,
    freeForAllocation,
    suggestedPrima,
    suggestedCesantiasInterest,
    hasDebts,
  }
}
