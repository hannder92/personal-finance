import { describe, expect, it } from 'vitest'
import {
  addPrimaPreset,
  calcPrimaServicios,
  type IncomeStreamPreset,
} from '@/lib/tax/colombia/prima'

describe('lib/tax/colombia/prima', () => {
  it('TC-U-040 (AC-3.3): calcPrimaServicios(4_000_000) returns half salary, semiannual frequency', () => {
    expect(calcPrimaServicios(4_000_000)).toEqual({
      amount: 2_000_000,
      frequency: 'semiannual',
    })
  })

  it('TC-U-041 (AC-3.3): addPrimaPreset is idempotent (no duplicate)', () => {
    const existing: IncomeStreamPreset[] = [
      { id: 'p1', label: 'Prima de servicios', amount: 2_000_000, frequency: 'semiannual' },
    ]
    const result = addPrimaPreset(existing, 4_000_000)
    expect(result).toHaveLength(1)
  })

  it('AC-3.3: addPrimaPreset adds entry when none exists', () => {
    const result = addPrimaPreset([], 4_000_000)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      label: 'Prima de servicios',
      amount: 2_000_000,
      frequency: 'semiannual',
    })
    expect(result[0]?.id).toBeTruthy()
  })

  it('AC-3.3: returns NEW array (does not mutate input)', () => {
    const input: IncomeStreamPreset[] = []
    const result = addPrimaPreset(input, 4_000_000)
    expect(input).toHaveLength(0)
    expect(result).not.toBe(input)
  })
})
