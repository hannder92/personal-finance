export interface AllocationPct {
  needs: number
  wants: number
  savings: number
}

export interface AllocationAmounts {
  needs: number
  wants: number
  savings: number
}

export function calcAllocationAmounts(
  allocation: AllocationPct,
  totalIncome: number
): AllocationAmounts {
  return {
    needs: totalIncome * (allocation.needs / 100),
    wants: totalIncome * (allocation.wants / 100),
    savings: totalIncome * (allocation.savings / 100),
  }
}

export function calcSavingsComplement(needs: number, wants: number): number {
  return 100 - needs - wants
}

export function calcSavingsRate(totalIncome: number, totalSaved: number): number {
  if (totalIncome <= 0) return 0
  return (totalSaved / totalIncome) * 100
}

export function calcGoalExcess(totalGoalMonthlyContrib: number, savingsBucket: number): number {
  return Math.max(0, totalGoalMonthlyContrib - savingsBucket)
}

export function debtExceedsSavings(
  debtMonthlyObligations: number,
  savingsBucketAmount: number
): boolean {
  return debtMonthlyObligations > savingsBucketAmount
}
