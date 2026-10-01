export function detectMonthRollover(lastMonthSeen: string, currentMonth: string): boolean {
  return lastMonthSeen !== currentMonth
}

export function formatYearMonth(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

// Returns the month to close (the last month seen) when the calendar has moved
// forward past it; null on first run, same month, or a clock that went backwards.
export function getMonthToClose(lastMonthSeen: string | null, currentMonth: string): string | null {
  if (!lastMonthSeen) return null
  return lastMonthSeen < currentMonth ? lastMonthSeen : null
}
