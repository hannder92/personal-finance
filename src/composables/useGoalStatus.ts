// Bridge: goal → ETA, schedule status and required monthly contribution.

import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { calcGoalETA, calcRequiredMonthly, parseLocalDate } from '@/lib/calculations/goals'
import type { Goal } from '@/stores/goalsStore'

export function useGoalStatus(
  goal: MaybeRefOrGetter<Goal | undefined>,
  now: () => Date = () => new Date()
) {
  const eta = computed(() => {
    const g = toValue(goal)
    return g ? calcGoalETA(g, now()) : null
  })

  const targetDate = computed(() => {
    const g = toValue(goal)
    return g?.targetDate ? parseLocalDate(g.targetDate) : null
  })

  const requiredMonthly = computed(() => {
    const g = toValue(goal)
    if (!g?.targetDate) return null
    return calcRequiredMonthly({ ...g, targetDate: g.targetDate }, now())
  })

  return { eta, targetDate, requiredMonthly }
}
