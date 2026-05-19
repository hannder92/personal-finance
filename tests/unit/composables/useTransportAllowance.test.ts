// Tests for composables/useTransportAllowance.
// Feature: 20260516-sprint1-mejoras-finanzas · Covers AC-5.1, AC-5.3, AC-5.4, AC-5.5.
// TCs: TC-U-011..016.
//
// RED today because the stub returns frozen refs and dismiss/accept are no-ops.

import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTransportAllowance } from '@/composables/useTransportAllowance'
import { useIncomeStore } from '@/stores/incomeStore'

describe('useTransportAllowance (AC-5.1, 5.3, 5.4, 5.5)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('TC-U-011 (AC-5.1): salary 2_000_000 + no transport benefit → shouldShow=true', () => {
    const income = useIncomeStore()
    income.setGrossSalary(2_000_000)
    const allowance = useTransportAllowance()
    expect(allowance.shouldShow.value).toBe(true)
  })

  it('TC-U-012 (AC-5.3): salary qualifies but benefit already present → shouldShow=false', () => {
    const income = useIncomeStore()
    income.setGrossSalary(2_000_000)
    income.addBenefit({ label: 'Auxilio de transporte', amount: 200_000 })
    const allowance = useTransportAllowance()
    expect(allowance.shouldShow.value).toBe(false)
  })

  it('TC-U-013 (AC-5.1 negative): salary 3_000_000 > threshold → shouldShow=false', () => {
    const income = useIncomeStore()
    income.setGrossSalary(3_000_000)
    const allowance = useTransportAllowance()
    expect(allowance.shouldShow.value).toBe(false)
  })

  it('TC-U-014 (EC-2): salary exactly 2_847_000 (2×SMMLV) → shouldShow=true (inclusive)', () => {
    const income = useIncomeStore()
    income.setGrossSalary(2_847_000)
    const allowance = useTransportAllowance()
    expect(allowance.shouldShow.value).toBe(true)
  })

  it('TC-U-015 (AC-5.4): dismiss() suppresses banner for the session', () => {
    const income = useIncomeStore()
    income.setGrossSalary(2_000_000)
    const allowance = useTransportAllowance()
    expect(allowance.shouldShow.value).toBe(true)
    allowance.dismiss()
    expect(allowance.shouldShow.value).toBe(false)
    // Re-evaluate by reading shouldShow again — must remain false.
    expect(allowance.shouldShow.value).toBe(false)
  })

  it('TC-U-016 (AC-5.5): showThresholdNotice=true when benefit present and salary rises above threshold', () => {
    const income = useIncomeStore()
    income.setGrossSalary(2_000_000)
    income.addBenefit({ label: 'Auxilio de transporte', amount: 200_000 })
    const allowance = useTransportAllowance()
    expect(allowance.showThresholdNotice.value).toBe(false)
    income.setGrossSalary(3_500_000)
    expect(allowance.showThresholdNotice.value).toBe(true)
  })
})
