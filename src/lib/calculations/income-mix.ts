import { calcMonthlyEquivalent } from '@/lib/calculations/frequency'
import type { Frequency } from '@/lib/calculations/frequency'

export type IncomeClass = 'linear' | 'residual' | 'passive'

export interface IncomeMixResult {
  linear: number
  residual: number
  passive: number
}

export interface IncomeMixInputs {
  salaryNetMonthly: number
  streams: ReadonlyArray<{
    amount: number
    frequency: Frequency
    incomeClass: IncomeClass
  }>
}

export function calcIncomeMixByClass(inputs: IncomeMixInputs): IncomeMixResult {
  const mix: IncomeMixResult = {
    linear: inputs.salaryNetMonthly,
    residual: 0,
    passive: 0,
  }
  for (const stream of inputs.streams) {
    const monthly = calcMonthlyEquivalent({
      amount: stream.amount,
      frequency: stream.frequency,
    })
    mix[stream.incomeClass] += monthly
  }
  return mix
}
