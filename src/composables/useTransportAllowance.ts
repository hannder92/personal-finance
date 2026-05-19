// Suggests the legal Colombian transport allowance when the user's salary
// qualifies (≤ 2 × SMMLV) and the benefit is not already registered.
// AC-5.4 dismiss persists for the session (module-level ref, never sessionStorage).

import { computed, ref, type ComputedRef } from 'vue'
import {
  AUXILIO_TRANSPORTE_2025,
  TRANSPORT_THRESHOLD,
} from '@/lib/tax/colombia/constants'
import { useIncomeStore } from '@/stores/incomeStore'

export interface TransportAllowance {
  shouldShow: ComputedRef<boolean>
  showThresholdNotice: ComputedRef<boolean>
  dismiss: () => void
  accept: () => void
}

// Session-scoped flags. Reset only on full page reload per ADR-4.
const dismissed = ref(false)
const hadAllowanceBelowThreshold = ref(false)

function hasTransportBenefit(benefits: ReadonlyArray<{ label: string }>): boolean {
  return benefits.some((b) => /^auxilio.*transporte/i.test(b.label))
}

export function useTransportAllowance(): TransportAllowance {
  const income = useIncomeStore()

  // Track "had allowance below threshold" so AC-5.5 can show a notice when
  // salary rises above the threshold while the benefit is still attached.
  const qualifiesNow = computed(
    () => income.state.grossSalary > 0 && income.state.grossSalary <= TRANSPORT_THRESHOLD
  )
  const hasBenefit = computed(() => hasTransportBenefit(income.state.nonSalaryBenefits))

  // Set the latch when the user has a transport benefit AND is at/under threshold.
  // Reading the computed elsewhere triggers this side-effect via the qualifiesNow watcher path.
  const _latchEffect = computed(() => {
    if (qualifiesNow.value && hasBenefit.value) {
      hadAllowanceBelowThreshold.value = true
    }
    return null
  })

  const shouldShow = computed(() => {
    // Touch the latch to keep it reactive on reads.
    void _latchEffect.value
    if (dismissed.value) return false
    if (hasBenefit.value) return false
    return qualifiesNow.value
  })

  const showThresholdNotice = computed(() => {
    void _latchEffect.value
    return (
      hadAllowanceBelowThreshold.value &&
      hasBenefit.value &&
      income.state.grossSalary > TRANSPORT_THRESHOLD
    )
  })

  function dismiss(): void {
    dismissed.value = true
  }

  function accept(): void {
    if (hasBenefit.value) return
    income.addBenefit({ label: 'Auxilio de transporte', amount: AUXILIO_TRANSPORTE_2025 })
    hadAllowanceBelowThreshold.value = qualifiesNow.value
  }

  return { shouldShow, showThresholdNotice, dismiss, accept }
}
