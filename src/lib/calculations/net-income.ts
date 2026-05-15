export interface DeductionInput {
  amount: number
  type: 'fixed' | 'percent'
}

export interface NonSalaryBenefitInput {
  amount: number
}

export interface NetIncomeInputs {
  grossSalary: number
  deductions: ReadonlyArray<DeductionInput>
  nonSalaryBenefits?: ReadonlyArray<NonSalaryBenefitInput>
}

// Net salary = gross − sum(deductions on gross only) + sum(non-salary benefits).
// Per AC-2.4 and project rule `node-colombia-payroll.md`: non-salary benefits never enter
// the deduction base — they are added after deductions are subtracted.
export function calcNetSalary(inputs: NetIncomeInputs): number {
  const { grossSalary, deductions, nonSalaryBenefits = [] } = inputs

  const totalDeductions = deductions.reduce((acc, d) => {
    const amount = d.type === 'percent' ? grossSalary * (d.amount / 100) : d.amount
    return acc + amount
  }, 0)

  const benefitsTotal = nonSalaryBenefits.reduce((acc, b) => acc + b.amount, 0)

  return Math.max(0, grossSalary - totalDeductions) + benefitsTotal
}
