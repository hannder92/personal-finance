import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useBaseMetrics } from '@/composables/useBaseMetrics'
import { calcRetencion } from '@/lib/tax/colombia/retencion'
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
