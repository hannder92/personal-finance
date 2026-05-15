export interface IncomeStreamPreset {
  id: string
  label: string
  amount: number
  frequency: 'monthly' | 'quarterly' | 'semiannual' | 'annual'
}

export interface PrimaCalc {
  amount: number
  frequency: 'semiannual'
}

const PRIMA_LABEL = 'Prima de servicios'

// Prima de servicios (Art. 306 CST): one month of salary per year, paid in two installments
// (June 30 and December 20). Monthly equivalent at half salary in semiannual frequency.
export function calcPrimaServicios(grossSalary: number): PrimaCalc {
  return {
    amount: grossSalary / 2,
    frequency: 'semiannual',
  }
}

export function addPrimaPreset(
  streams: IncomeStreamPreset[],
  grossSalary: number
): IncomeStreamPreset[] {
  const exists = streams.some((s) => s.label.toLowerCase() === PRIMA_LABEL.toLowerCase())
  if (exists) return [...streams]
  const { amount, frequency } = calcPrimaServicios(grossSalary)
  return [...streams, { id: crypto.randomUUID(), label: PRIMA_LABEL, amount, frequency }]
}
