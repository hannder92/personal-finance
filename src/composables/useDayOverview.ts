import { computed, type ComputedRef } from 'vue'
import {
  buildAgendaThreeDays,
  calcDayCoverage,
  listDebtsDueOnDay,
  sumMinPaymentsDueToday,
  type AgendaDayRow,
  type DayCoverageStatus,
  type DebtDueSlice,
} from '@/lib/calculations/day-obligations'
import { useCardsStore } from '@/stores/cardsStore'
import { useLiquidMetrics } from '@/composables/useLiquidMetrics'

export interface DayCoverageView {
  status: DayCoverageStatus
  shortfallAmount: number
  dueTodayTotal: number
  liquidTotal: number
}

export interface UseDayOverviewOptions {
  today?: Date
}

export interface UseDayOverview {
  today: ComputedRef<Date>
  coverage: ComputedRef<DayCoverageView>
  paymentsToday: ComputedRef<DebtDueSlice[]>
  agenda: ComputedRef<AgendaDayRow[]>
}

export function useDayOverview(options?: UseDayOverviewOptions): UseDayOverview {
  const cards = useCardsStore()
  const { liquidAssets } = useLiquidMetrics()

  const today = computed(() => options?.today ?? new Date())

  const debtInputs = computed(() =>
    cards.state.items.map((d) => ({
      id: d.id,
      name: d.name,
      minPayment: d.minPayment,
      dueDate: d.type === 'card' ? d.dueDate : null,
      type: d.type,
    }))
  )

  const paymentsToday = computed(() => listDebtsDueOnDay(debtInputs.value, today.value))

  const dueTodayTotal = computed(() => sumMinPaymentsDueToday(debtInputs.value, today.value))

  const liquidTotal = computed(() => liquidAssets.value)

  const coverage = computed(() => {
    const base = calcDayCoverage({
      liquidTotal: liquidTotal.value,
      dueTodayTotal: dueTodayTotal.value,
    })
    return {
      ...base,
      dueTodayTotal: dueTodayTotal.value,
      liquidTotal: liquidTotal.value,
    }
  })

  const agenda = computed(() => buildAgendaThreeDays(debtInputs.value, today.value))

  return { today, coverage, paymentsToday, agenda }
}
