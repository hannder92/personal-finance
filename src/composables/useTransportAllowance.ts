// Stub for T-001 setup. Real implementation lands in T-026.
// Suggests the legal Colombian transport allowance when the user's salary
// qualifies (≤ 2 × SMMLV) and the benefit is not already registered.

import { ref, type Ref } from 'vue'

export interface TransportAllowance {
  shouldShow: Ref<boolean>
  showThresholdNotice: Ref<boolean>
  dismiss: () => void
  accept: () => void
}

export function useTransportAllowance(): TransportAllowance {
  return {
    shouldShow: ref(false),
    showThresholdNotice: ref(false),
    dismiss: () => {},
    accept: () => {},
  }
}
