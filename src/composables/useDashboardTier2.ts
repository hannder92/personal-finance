import { computed, ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import {
  computeTier2State,
  readTier2Expanded,
  writeTier2Expanded,
} from '@/lib/dashboard-tier2-storage'
import { useIncomeStore } from '@/stores/incomeStore'

export function useDashboardTier2() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const income = useIncomeStore()

  const hasIncome = computed(() => income.state.grossSalary > 0)

  const isExpanded = ref(
    typeof sessionStorage !== 'undefined' ? readTier2Expanded(sessionStorage) : false
  )

  const derived = computed(() =>
    computeTier2State({
      isDesktop: isDesktop.value,
      hasIncome: hasIncome.value,
      isExpanded: isExpanded.value,
    })
  )

  const tier2Visible = computed(() => derived.value.tier2Visible)
  const canToggle = computed(() => derived.value.canToggle)

  function toggle() {
    if (!canToggle.value) return
    isExpanded.value = !isExpanded.value
    if (typeof sessionStorage !== 'undefined') {
      writeTier2Expanded(sessionStorage, isExpanded.value)
    }
  }

  watch(hasIncome, (value) => {
    if (!value) isExpanded.value = false
  })

  return {
    tier2Visible,
    canToggle,
    isExpanded,
    isDesktop,
    hasIncome,
    toggle,
  }
}
