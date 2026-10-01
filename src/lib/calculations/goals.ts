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

export function calcGoalETA(goal: GoalInput, now: Date = new Date()): GoalETA {
  const shortfall = goal.target - goal.saved
  const target = goal.targetDate ? parseLocalDate(goal.targetDate) : null
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const overdue = target !== null && shortfall > 0 ? target < today : false

  if (shortfall <= 0) {
    return { months: 0, estimatedDate: today, overdue: false, behindSchedule: false }
  }
  if (goal.monthlyContrib <= 0) {
    return {
      months: Number.POSITIVE_INFINITY,
      estimatedDate: null,
      overdue,
      behindSchedule: target !== null,
    }
  }
  const months = Math.ceil(shortfall / goal.monthlyContrib)
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
  now: Date = new Date()
): number {
  const shortfall = Math.max(0, goal.target - goal.saved)
  const target = parseLocalDate(goal.targetDate)
  const months =
    (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
  if (months <= 0) return shortfall
  return shortfall / months
}
