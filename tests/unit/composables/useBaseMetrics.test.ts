import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useBaseMetrics } from '@/composables/useBaseMetrics'
import { calcRetencion } from '@/lib/tax/colombia/retencion'
import { useCardsStore } from '@/stores/cardsStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useIncomeStore } from '@/stores/incomeStore'
import { useSettingsStore } from '@/stores/settingsStore'

describe('composables/useBaseMetrics — retención in net income', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('subtracts the estimated retención by default', () => {
    const income = useIncomeStore()
    income.setGrossSalary(12_000_000)
    const base = useBaseMetrics()
    const expected = calcRetencion(12_000_000).amount
    expect(expected).toBeGreaterThan(0)
    expect(base.retencionApplied.value).toBe(expected)
    expect(base.netSalary.value).toBeCloseTo(12_000_000 - expected)
  })

  it('does not subtract it when the toggle is off', () => {
    useIncomeStore().setGrossSalary(12_000_000)
    useSettingsStore().setDeductRetencion(false)
    expect(useBaseMetrics().netSalary.value).toBe(12_000_000)
  })

  it('does not subtract it twice when a manual retención deduction exists', () => {
    const income = useIncomeStore()
    income.setGrossSalary(12_000_000)
    income.addDeduction({ label: 'Retención en la fuente', amount: 500_000, type: 'fixed' })
    const base = useBaseMetrics()
    expect(base.hasManualRetencion.value).toBe(true)
    expect(base.retencionApplied.value).toBe(0)
    expect(base.netSalary.value).toBe(11_500_000)
  })

  it('only applies to COP', () => {
    useIncomeStore().setGrossSalary(12_000_000)
    useSettingsStore().setCurrency('USD')
    expect(useBaseMetrics().retencionEstimate.value).toBe(0)
  })

  it('DTI base is gross income including other streams', () => {
    const income = useIncomeStore()
    income.setGrossSalary(5_000_000)
    income.addStream({ label: 'Arriendo', amount: 1_200_000, frequency: 'monthly' })
    expect(useBaseMetrics().grossMonthlyIncome.value).toBe(6_200_000)
  })
})

describe('composables/useBaseMetrics — libranza (payroll-deducted loan)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useSettingsStore().setDeductRetencion(false)
    useIncomeStore().setGrossSalary(10_000_000)
    useExpensesStore().add({ name: 'Arriendo', amount: 3_000_000, category: 'vivienda' })
  })

  function addLoan(payrollDeducted: boolean) {
    useCardsStore().addLoan({
      type: 'loan',
      name: 'Crédito',
      balance: 50_000_000,
      apr: 17,
      minPayment: 2_000_000,
      remainingInstallments: 36,
      payrollDeducted,
    })
  }

  it('subtracts the libranza from net salary instead of the cash outflow', () => {
    addLoan(true)
    const base = useBaseMetrics()
    expect(base.payrollDebtObligation.value).toBe(2_000_000)
    expect(base.netSalary.value).toBe(8_000_000)
    expect(base.cashDebtObligation.value).toBe(0)
    expect(base.freeForAllocation.value).toBe(5_000_000)
    // Still debt: DTI base and the no-salary outflow keep it.
    expect(base.debtObligation.value).toBe(2_000_000)
    expect(base.monthlyOutflow.value).toBe(5_000_000)
  })

  it('a normal loan leaves net salary alone and is paid from the account', () => {
    addLoan(false)
    const base = useBaseMetrics()
    expect(base.netSalary.value).toBe(10_000_000)
    expect(base.cashDebtObligation.value).toBe(2_000_000)
    expect(base.freeForAllocation.value).toBe(5_000_000)
  })

  it('does not count the cuota twice when the libranza is also a payslip deduction', () => {
    useIncomeStore().addDeduction({ label: 'Libranza banco', amount: 2_000_000, type: 'fixed' })
    addLoan(true)
    const base = useBaseMetrics()
    expect(base.hasManualLibranza.value).toBe(true)
    expect(base.payrollDeductionApplied.value).toBe(0)
    expect(base.netSalary.value).toBe(8_000_000)
    expect(base.freeForAllocation.value).toBe(5_000_000)
    expect(base.debtObligation.value).toBe(2_000_000)
  })
})
