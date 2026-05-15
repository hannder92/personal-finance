export function detectMonthRollover(lastMonthSeen: string, currentMonth: string): boolean {
  return lastMonthSeen !== currentMonth
}

export function formatYearMonth(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}
