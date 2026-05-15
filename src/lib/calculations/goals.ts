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
}

export function calcGoalETA(goal: GoalInput): GoalETA {
  const shortfall = goal.target - goal.saved
  const overdue = goal.targetDate ? new Date(goal.targetDate) < new Date() : false

  if (shortfall <= 0) {
    return { months: 0, estimatedDate: new Date(), overdue }
  }
  if (goal.monthlyContrib <= 0) {
    return { months: Number.POSITIVE_INFINITY, estimatedDate: null, overdue }
  }
  const months = Math.ceil(shortfall / goal.monthlyContrib)
  const now = new Date()
  const estimatedDate = new Date(now.getFullYear(), now.getMonth() + months, now.getDate())
  return { months, estimatedDate, overdue }
}

export function calcRequiredMonthly(goal: GoalInput & { targetDate: string }): number {
  const shortfall = Math.max(0, goal.target - goal.saved)
  const now = new Date()
  const target = new Date(goal.targetDate)
  const months =
    (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
  if (months <= 0) return shortfall
  return shortfall / months
}
