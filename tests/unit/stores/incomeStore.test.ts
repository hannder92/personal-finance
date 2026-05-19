import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useIncomeStore } from '@/stores/incomeStore'

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

describe('incomeStore (T-043)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('setGrossSalary mutates when non-negative', () => {
    const s = useIncomeStore()
    s.setGrossSalary(5_000_000)
    expect(s.state.grossSalary).toBe(5_000_000)
  })

  it('setGrossSalary rejects negative values (state unchanged)', () => {
    const s = useIncomeStore()
    s.setGrossSalary(3_000_000)
    s.setGrossSalary(-100)
    expect(s.state.grossSalary).toBe(3_000_000)
  })

  it('addDeduction creates entity with UUID id', () => {
    const s = useIncomeStore()
    s.addDeduction({ label: 'Salud', amount: 4, type: 'percent' })
    expect(s.state.deductions.length).toBe(1)
    expect(s.state.deductions[0]!.id).toMatch(UUID_V4_REGEX)
  })

  it('addDeduction with invalid type does not insert', () => {
    const s = useIncomeStore()
    // @ts-expect-error — testing runtime validation
    s.addDeduction({ label: 'X', amount: 4, type: 'invalid' })
    expect(s.state.deductions.length).toBe(0)
  })

  it('addDeduction with empty label does not insert', () => {
    const s = useIncomeStore()
    s.addDeduction({ label: '', amount: 4, type: 'percent' })
    expect(s.state.deductions.length).toBe(0)
  })

  it('removeDeduction removes by id', () => {
    const s = useIncomeStore()
    s.addDeduction({ label: 'A', amount: 4, type: 'percent' })
    const id = s.state.deductions[0]!.id
    s.removeDeduction(id)
    expect(s.state.deductions.length).toBe(0)
  })

  it('updateDeduction patches existing deduction', () => {
    const s = useIncomeStore()
    s.addDeduction({ label: 'A', amount: 4, type: 'percent' })
    const id = s.state.deductions[0]!.id
    s.updateDeduction(id, { amount: 5 })
    expect(s.state.deductions[0]!.amount).toBe(5)
  })

  it('addStream creates IncomeStream with UUID', () => {
    const s = useIncomeStore()
    s.addStream({ label: 'Renta', amount: 800_000, frequency: 'monthly' })
    expect(s.state.otherStreams.length).toBe(1)
    expect(s.state.otherStreams[0]!.id).toMatch(UUID_V4_REGEX)
  })

  it('addBenefit creates NonSalaryBenefit with UUID', () => {
    const s = useIncomeStore()
    s.addBenefit({ label: 'Conectividad', amount: 100_000 })
    expect(s.state.nonSalaryBenefits.length).toBe(1)
    expect(s.state.nonSalaryBenefits[0]!.id).toMatch(UUID_V4_REGEX)
  })

  it('applyColombiaPresets adds Salud 4% + Pensión 4% only; idempotent on Salud', () => {
    const s = useIncomeStore()
    s.applyColombiaPresets()
    expect(s.state.deductions.length).toBe(2)
    const labels = s.state.deductions.map((d) => d.label.toLowerCase())
    expect(labels).toContain('salud')
    expect(labels).toContain('pensión')
    expect(labels).not.toContain('arl')

    // Idempotent: second call does not duplicate
    s.applyColombiaPresets()
    expect(s.state.deductions.length).toBe(2)
  })

  // ── sprint1-mejoras-finanzas (US-4 solidaridad) — TC-U-024, TC-U-025
  it('TC-U-024 (AC-4.1): applyColombiaPresets at gross=8M adds solidarity (id=__solidarity__, amount=1)', () => {
    const s = useIncomeStore()
    s.setGrossSalary(8_000_000)
    s.applyColombiaPresets()
    const solidarity = s.state.deductions.find((d) => d.id === '__solidarity__')
    expect(solidarity).toBeTruthy()
    expect(solidarity?.type).toBe('percent')
    expect(solidarity?.amount).toBe(1)
  })

  it('TC-U-025 (AC-4.4): solidarity persists after gross drops below 4 SMMLV (no auto-remove)', () => {
    const s = useIncomeStore()
    s.setGrossSalary(8_000_000)
    s.applyColombiaPresets()
    expect(s.state.deductions.find((d) => d.id === '__solidarity__')).toBeTruthy()
    s.setGrossSalary(3_000_000)
    expect(s.state.deductions.find((d) => d.id === '__solidarity__')).toBeTruthy()
  })

  it('addPrimaPreset adds semiannual stream at half grossSalary; idempotent', () => {
    const s = useIncomeStore()
    s.setGrossSalary(4_000_000)
    s.addPrimaPreset()
    expect(s.state.otherStreams.length).toBe(1)
    expect(s.state.otherStreams[0]!.amount).toBe(2_000_000)
    expect(s.state.otherStreams[0]!.frequency).toBe('semiannual')

    s.addPrimaPreset()
    expect(s.state.otherStreams.length).toBe(1)
  })
})

// Tests for feature spec 20260515-fix-calculos-financieros.
// AC-7.1: prima entry created with reserved id '__prima__' and isPrima: true.
// AC-7.2: upsert behavior — second call updates amount when salary changes (no duplicate).
// ADR-6: addStream MUST reject mismatched id/isPrima combinations.
// These tests RED today: current store uses random UUID, no isPrima flag, returns early on second call.
describe('incomeStore — fix-calculos-financieros (prima upsert + guards)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('TC-U-015 (AC-7.1): addPrimaPreset creates entry with id "__prima__" and isPrima: true', () => {
    const s = useIncomeStore()
    s.setGrossSalary(12_000_000)
    s.addPrimaPreset()
    expect(s.state.otherStreams.length).toBe(1)
    const prima = s.state.otherStreams[0]!
    expect(prima.id).toBe('__prima__')
    // @ts-expect-error — isPrima will be added to IncomeStream in T-015
    expect(prima.isPrima).toBe(true)
    expect(prima.frequency).toBe('semiannual')
    expect(prima.amount).toBe(6_000_000) // gross / 2
  })

  it('TC-U-016 (AC-7.2): second addPrimaPreset with updated salary upserts (no duplicate, new amount)', () => {
    const s = useIncomeStore()
    s.setGrossSalary(10_000_000)
    s.addPrimaPreset()
    expect(s.state.otherStreams[0]!.amount).toBe(5_000_000)

    s.setGrossSalary(12_000_000)
    s.addPrimaPreset()
    expect(s.state.otherStreams.length).toBe(1) // still ONE entry
    expect(s.state.otherStreams[0]!.amount).toBe(6_000_000) // updated
    expect(s.state.otherStreams[0]!.id).toBe('__prima__')
  })

  it('ADR-6: addStream rejects id "__prima__" when isPrima is not true', () => {
    const s = useIncomeStore()
    s.addStream({
      // @ts-expect-error — id is intentionally provided to test the guard
      id: '__prima__',
      label: 'Fake prima',
      amount: 1_000_000,
      frequency: 'monthly',
    })
    expect(s.state.otherStreams.length).toBe(0)
  })

  it('ADR-6: addStream rejects isPrima: true when id is not "__prima__"', () => {
    const s = useIncomeStore()
    s.addStream({
      // @ts-expect-error — isPrima will be supported after T-015
      isPrima: true,
      id: 'random-uuid-here',
      label: 'Stream pretending to be prima',
      amount: 1_000_000,
      frequency: 'semiannual',
    })
    expect(s.state.otherStreams.length).toBe(0)
  })

  it('ADR-6: at most one stream with isPrima === true exists at any time', () => {
    const s = useIncomeStore()
    s.setGrossSalary(10_000_000)
    s.addPrimaPreset()
    s.addPrimaPreset() // calling again should not add a second prima
    const primaCount = s.state.otherStreams.filter(
      // @ts-expect-error — isPrima will be added to IncomeStream in T-015
      (stream) => stream.isPrima === true
    ).length
    expect(primaCount).toBe(1)
  })
})
