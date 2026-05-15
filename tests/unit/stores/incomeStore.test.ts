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
