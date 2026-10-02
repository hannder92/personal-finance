// Bridge: goal → ETA, schedule status, required monthly contribution and the
// inflation/return view of 20261002-proyecciones-reales.

import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import {
  calcGoalETA,
  calcRequiredMonthly,
  monthsUntil,
  parseLocalDate,
  type GoalAssumptions,
} from '@/lib/calculations/goals'
import { inflateToMonth } from '@/lib/calculations/real-projection'
import { useAssumptions } from '@/composables/useAssumptions'
import type { Goal } from '@/stores/goalsStore'

export type GoalScheduleStatus =
  | 'completed'
  | 'onTrack'
  | 'behind'
  | 'overdue'
  | 'noContrib'
  | 'noDate'

export function useGoalStatus(
  goal: MaybeRefOrGetter<Goal | undefined>,
  now: () => Date = () => new Date()
) {
  const { annualReturnPercent, inflationPercent } = useAssumptions()

  const assumptions = computed<GoalAssumptions>(() => ({
    annualReturnPercent: toValue(goal)?.invested ? annualReturnPercent.value : 0,
    inflationPercent: inflationPercent.value,
  }))
  const withoutReturn = computed<GoalAssumptions>(() => ({
    annualReturnPercent: 0,
    inflationPercent: inflationPercent.value,
  }))

  const eta = computed(() => {
    const g = toValue(goal)
    return g ? calcGoalETA(g, now(), assumptions.value) : null
  })

  const targetDate = computed(() => {
    const g = toValue(goal)
    return g?.targetDate ? parseLocalDate(g.targetDate) : null
  })

  const monthsToTargetDate = computed(() => {
    const g = toValue(goal)
    return g?.targetDate ? monthsUntil(g.targetDate, now()) : null
  })

  const requiredMonthly = computed(() => {
    const g = toValue(goal)
    if (!g?.targetDate) return null
    return calcRequiredMonthly({ ...g, targetDate: g.targetDate }, now(), assumptions.value)
  })

  const completed = computed(() => {
    const g = toValue(goal)
    return !!g && g.saved >= g.target
  })

  const status = computed<GoalScheduleStatus>(() => {
    if (completed.value) return 'completed'
    const e = eta.value
    if (e?.overdue) return 'overdue'
    if (e && e.months === Number.POSITIVE_INFINITY && toValue(goal)?.monthlyContrib === 0) {
      return 'noContrib'
    }
    if (!targetDate.value) return 'noDate'
    return e?.behindSchedule ? 'behind' : 'onTrack'
  })

  /** AC-3.2: the goal amount in pesos of its target month (or estimated month). */
  const inflatedTarget = computed<{ amount: number; date: Date } | null>(() => {
    const g = toValue(goal)
    if (!g || completed.value || inflationPercent.value === 0) return null
    const n = now()
    const months =
      monthsToTargetDate.value !== null && monthsToTargetDate.value > 0
        ? monthsToTargetDate.value
        : eta.value && Number.isFinite(eta.value.months) && eta.value.months > 0
          ? eta.value.months
          : null
    if (months === null) return null
    return {
      amount: inflateToMonth(g.target, months, inflationPercent.value),
      date: new Date(n.getFullYear(), n.getMonth() + months, 1),
    }
  })

  /** AC-3.6: what investing buys versus keeping the money uninvested. */
  const investBenefit = computed<{
    monthsEarlier: number | null
    monthlyLess: number | null
  } | null>(() => {
    const g = toValue(goal)
    if (!g || !g.invested || annualReturnPercent.value <= 0 || completed.value) return null
    const invested = eta.value
    if (!invested || !Number.isFinite(invested.months)) return null
    const plain = calcGoalETA(g, now(), withoutReturn.value)
    const monthsEarlier = Number.isFinite(plain.months) ? plain.months - invested.months : null
    let monthlyLess: number | null = null
    if (g.targetDate && requiredMonthly.value !== null) {
      const plainRequired = calcRequiredMonthly(
        { ...g, targetDate: g.targetDate },
        now(),
        withoutReturn.value
      )
      // Difference of the rounded amounts the card shows, so the numbers add up on screen.
      monthlyLess = Math.round(plainRequired) - Math.round(requiredMonthly.value)
    }
    return { monthsEarlier, monthlyLess }
  })

  return {
    eta,
    targetDate,
    monthsToTargetDate,
    requiredMonthly,
    completed,
    status,
    inflatedTarget,
    investBenefit,
  }
}
