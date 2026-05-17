// Full impl (T-043). UUID v4 for IDs; lightweight runtime guards at action boundaries
// (formal Zod parse via lib/storage/schema.ts validates the full snapshot on load).

import { defineStore } from 'pinia'
import { reactive } from 'vue'

export type DeductionType = 'fixed' | 'percent'
export type IncomeFrequency = 'monthly' | 'quarterly' | 'semiannual' | 'annual'

export interface Deduction {
  id: string
  label: string
  amount: number
  type: DeductionType
}

export interface IncomeStream {
  id: string
  label: string
  amount: number
  frequency: IncomeFrequency
  /** Marker for the auto-managed prima de servicios entry. Always paired with id === PRIMA_ID. */
  isPrima?: boolean
}

/** Reserved id for the auto-managed prima de servicios stream. ADR-6 in 2-plan.md. */
export const PRIMA_ID = '__prima__'

export interface NonSalaryBenefit {
  id: string
  label: string
  amount: number
}

export interface IncomeState {
  grossSalary: number
  deductions: Deduction[]
  otherStreams: IncomeStream[]
  nonSalaryBenefits: NonSalaryBenefit[]
}

const ALLOWED_TYPES: DeductionType[] = ['fixed', 'percent']
const ALLOWED_FREQS: IncomeFrequency[] = ['monthly', 'quarterly', 'semiannual', 'annual']

function newId(): string {
  return globalThis.crypto.randomUUID()
}

function isValidLabel(label: string): boolean {
  return typeof label === 'string' && label.length > 0 && label.length <= 60
}

function isValidAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount >= 0
}

export const useIncomeStore = defineStore('income', () => {
  const state = reactive<IncomeState>({
    grossSalary: 0,
    deductions: [],
    otherStreams: [],
    nonSalaryBenefits: [],
  })

  function setGrossSalary(gross: number): void {
    if (!isValidAmount(gross)) return
    state.grossSalary = gross
  }

  function addDeduction(input: Omit<Deduction, 'id'>): void {
    if (!isValidLabel(input.label)) return
    if (!isValidAmount(input.amount)) return
    if (!ALLOWED_TYPES.includes(input.type)) return
    state.deductions.push({ ...input, id: newId() })
  }
  function removeDeduction(id: string): void {
    const idx = state.deductions.findIndex((x) => x.id === id)
    if (idx >= 0) state.deductions.splice(idx, 1)
  }
  function updateDeduction(id: string, patch: Partial<Omit<Deduction, 'id'>>): void {
    const item = state.deductions.find((x) => x.id === id)
    if (!item) return
    if (patch.label !== undefined && !isValidLabel(patch.label)) return
    if (patch.amount !== undefined && !isValidAmount(patch.amount)) return
    if (patch.type !== undefined && !ALLOWED_TYPES.includes(patch.type)) return
    Object.assign(item, patch)
  }

  function addStream(input: Omit<IncomeStream, 'id'> | IncomeStream): void {
    if (!isValidLabel(input.label)) return
    if (!isValidAmount(input.amount)) return
    if (!ALLOWED_FREQS.includes(input.frequency)) return

    // ADR-6 guards: isPrima ⇔ id === PRIMA_ID; at most one isPrima stream.
    const inputId = (input as IncomeStream).id
    const inputIsPrima = (input as IncomeStream).isPrima === true
    if (inputId === PRIMA_ID && !inputIsPrima) return
    if (inputIsPrima && inputId !== PRIMA_ID && inputId !== undefined) return
    if (inputIsPrima && state.otherStreams.some((s) => s.isPrima === true)) return

    const id = inputId === PRIMA_ID ? PRIMA_ID : newId()
    state.otherStreams.push({ ...input, id })
  }
  function removeStream(id: string): void {
    const idx = state.otherStreams.findIndex((x) => x.id === id)
    if (idx >= 0) state.otherStreams.splice(idx, 1)
  }

  function updateStream(id: string, patch: Partial<Omit<IncomeStream, 'id'>>): void {
    const item = state.otherStreams.find((x) => x.id === id)
    if (!item) return
    if (patch.label !== undefined && !isValidLabel(patch.label)) return
    if (patch.amount !== undefined && !isValidAmount(patch.amount)) return
    if (patch.frequency !== undefined && !ALLOWED_FREQS.includes(patch.frequency)) return
    Object.assign(item, patch)
  }

  function addBenefit(input: Omit<NonSalaryBenefit, 'id'>): void {
    if (!isValidLabel(input.label)) return
    if (!isValidAmount(input.amount)) return
    state.nonSalaryBenefits.push({ ...input, id: newId() })
  }
  function removeBenefit(id: string): void {
    const idx = state.nonSalaryBenefits.findIndex((x) => x.id === id)
    if (idx >= 0) state.nonSalaryBenefits.splice(idx, 1)
  }

  function applyColombiaPresets(): void {
    const existingLabels = new Set(state.deductions.map((d) => d.label.toLowerCase()))
    const presets: Array<Omit<Deduction, 'id'>> = [
      { label: 'Salud', amount: 4, type: 'percent' },
      { label: 'Pensión', amount: 4, type: 'percent' },
    ]
    for (const preset of presets) {
      if (!existingLabels.has(preset.label.toLowerCase())) {
        addDeduction(preset)
      }
    }
  }

  function addPrimaPreset(): void {
    // Prima de servicios: half of gross salary, paid semiannually (Art. 306 CST,
    // 6 months completos). Upsert by reserved id PRIMA_ID (ADR-6).
    const amount = state.grossSalary / 2
    const existing = state.otherStreams.find((s) => s.id === PRIMA_ID || s.isPrima === true)
    if (existing) {
      existing.amount = amount
      existing.id = PRIMA_ID
      existing.isPrima = true
      existing.frequency = 'semiannual'
      existing.label = 'Prima de servicios'
      return
    }
    state.otherStreams.push({
      id: PRIMA_ID,
      isPrima: true,
      label: 'Prima de servicios',
      amount,
      frequency: 'semiannual',
    })
  }

  return {
    state,
    setGrossSalary,
    addDeduction,
    removeDeduction,
    updateDeduction,
    addStream,
    removeStream,
    updateStream,
    addBenefit,
    removeBenefit,
    applyColombiaPresets,
    addPrimaPreset,
  }
})
