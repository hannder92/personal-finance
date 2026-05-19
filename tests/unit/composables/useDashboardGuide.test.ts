// Tests for composables/useDashboardGuide.
// Feature: 20260516-sprint1-mejoras-finanzas · Covers AC-3.1..3.4 · TC-U-003..006.
//
// RED today because the stub returns refs frozen at false/empty regardless of
// store state.

import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDashboardGuide } from '@/composables/useDashboardGuide'
import { useIncomeStore } from '@/stores/incomeStore'
import { useExpensesStore } from '@/stores/expensesStore'

describe('useDashboardGuide (AC-3.1..3.4)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('TC-U-003 (AC-3.1): no income → shouldShow=true and ctaTarget=income', () => {
    const guide = useDashboardGuide()
    expect(guide.shouldShow.value).toBe(true)
    expect(guide.ctaTarget.value).toBe('income')
  })

  it('TC-U-004 (AC-3.2): income set, no expenses → ctaTarget=expenses', () => {
    const income = useIncomeStore()
    income.setGrossSalary(3_000_000)
    const guide = useDashboardGuide()
    expect(guide.shouldShow.value).toBe(true)
    expect(guide.ctaTarget.value).toBe('expenses')
  })

  it('TC-U-005 (AC-3.3): both set → shouldShow=false', () => {
    const income = useIncomeStore()
    income.setGrossSalary(3_000_000)
    const expenses = useExpensesStore()
    expenses.add({ name: 'Arriendo', amount: 800_000, category: 'housing' })
    const guide = useDashboardGuide()
    expect(guide.shouldShow.value).toBe(false)
  })

  it('TC-U-006 (AC-3.4): income > 0 → hasCalculableIncome=true even when expenses empty', () => {
    const income = useIncomeStore()
    income.setGrossSalary(3_000_000)
    const guide = useDashboardGuide()
    expect(guide.hasCalculableIncome.value).toBe(true)
    expect(guide.shouldShow.value).toBe(true) // expenses still missing
  })
})
