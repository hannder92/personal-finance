export interface SavingsFeasibilityInputs {
  netIncome: number
  savingsPercent: number
  freeForAllocation: number
}

export interface SavingsFeasibilityResult {
  objective: number
  feasible: number
  gap: number
  isRuleViable: boolean
}

export function calcSavingsFeasibility(inputs: SavingsFeasibilityInputs): SavingsFeasibilityResult {
  const { netIncome, savingsPercent, freeForAllocation } = inputs
  const objective = Math.round((netIncome * savingsPercent) / 100)
  const feasible = Math.max(0, freeForAllocation)
  const gap = Math.max(0, objective - feasible)
  const isRuleViable = feasible >= objective
  return { objective, feasible, gap, isRuleViable }
}
