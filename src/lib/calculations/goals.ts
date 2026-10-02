import { monthsToReach, requiredMonthlyFor } from './real-projection'

export interface GoalInput {
  target: number
  saved: number
  monthlyContrib: number
  targetDate?: string | null
}

export interface GoalETA {
  months: number
  estimatedDate: Date | null
  overdue: boolean
  /** True when the estimated completion falls after the goal's target date. */
  behindSchedule: boolean
}

// Parses 'YYYY-MM-DD' as a local calendar date. `new Date('YYYY-MM-DD')` is UTC and
// shows the previous day in Colombia (UTC−5).
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

/** Return/inflation applied to a goal (20261002-proyecciones-reales). Omitted = neutral. */
export interface GoalAssumptions {
  annualReturnPercent: number
  inflationPercent: number
}

const NEUTRAL: GoalAssumptions = { annualReturnPercent: 0, inflationPercent: 0 }

/** Calendar months from `now` to the target date's month (negative when past). */
export function monthsUntil(targetDate: string, now: Date = new Date()): number {
  const target = parseLocalDate(targetDate)
  return (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
}

export function calcGoalETA(
  goal: GoalInput,
  now: Date = new Date(),
  assumptions: GoalAssumptions = NEUTRAL
): GoalETA {
  const shortfall = goal.target - goal.saved
  const target = goal.targetDate ? parseLocalDate(goal.targetDate) : null
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const overdue = target !== null && shortfall > 0 ? target < today : false

  if (shortfall <= 0) {
    return { months: 0, estimatedDate: today, overdue: false, behindSchedule: false }
  }
  const reached = monthsToReach({
    targetToday: goal.target,
    balance: goal.saved,
    monthlyContrib: goal.monthlyContrib,
    ...assumptions,
  })
  if (reached === null) {
    return {
      months: Number.POSITIVE_INFINITY,
      estimatedDate: null,
      overdue,
      behindSchedule: target !== null,
    }
  }
  const months = reached
  // Day 1 avoids month overflow (e.g. Jan 31 + 1 month → Mar 3).
  const estimatedDate = new Date(now.getFullYear(), now.getMonth() + months, 1)
  const behindSchedule =
    target !== null &&
    (estimatedDate.getFullYear() > target.getFullYear() ||
      (estimatedDate.getFullYear() === target.getFullYear() &&
        estimatedDate.getMonth() > target.getMonth()))
  return { months, estimatedDate, overdue, behindSchedule }
}

export function calcRequiredMonthly(
  goal: GoalInput & { targetDate: string },
  now: Date = new Date(),
  assumptions: GoalAssumptions = NEUTRAL
): number {
  return requiredMonthlyFor({
    targetToday: goal.target,
    balance: goal.saved,
    months: monthsUntil(goal.targetDate, now),
    ...assumptions,
  })
}
