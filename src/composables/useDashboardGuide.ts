// Stub for T-001 setup. Real implementation lands in T-015.
// Determines whether to show an empty-state CTA on the dashboard and which
// section is the highest-priority missing data.

import { ref, type Ref } from 'vue'

export type DashboardCtaTarget = '' | 'income' | 'expenses'

export interface DashboardGuide {
  shouldShow: Ref<boolean>
  ctaTarget: Ref<DashboardCtaTarget>
  ctaLabel: Ref<string>
  hasCalculableIncome: Ref<boolean>
}

export function useDashboardGuide(): DashboardGuide {
  return {
    shouldShow: ref(false),
    ctaTarget: ref<DashboardCtaTarget>(''),
    ctaLabel: ref(''),
    hasCalculableIncome: ref(false),
  }
}
