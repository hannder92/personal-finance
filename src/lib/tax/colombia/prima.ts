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

// Prima de servicios (Art. 306 CST): for a worker who completed the full 6-month period,
// prima = salario mensual × días en el semestre / 180 — which simplifies to grossSalary / 2
// per semester. Two annual installments (mid-year and December).
//
// Auxilio de transporte (Art. 7 Ley 1/1963) is INTENTIONALLY EXCLUDED from this calculation.
// It applies only to workers earning up to 2 SMMLV (~$2.8M COP in 2025). The personal-finances
// target user typically earns above that threshold, so simplifying out the auxilio keeps the
// math clean. Out of scope per spec 20260515-fix-calculos-financieros (US-7 Limitación).
//
// Proportional prima for partial semesters (< 6 months worked) is also out of scope; the user
// must adjust the amount manually via the income form.
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
