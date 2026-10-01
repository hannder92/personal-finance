// Dashboard monthly base: other streams in income, variable spending out,
// paid installments excluded, one income base for DTI and health score.
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useNetIncome } from '@/composables/useNetIncome'
import { useDTI } from '@/composables/useDTI'
import { useHealthScore } from '@/composables/useHealthScore'
import { useCashFlowProjection } from '@/composables/useCashFlowProjection'
import { useIncomeStore } from '@/stores/incomeStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useCardsStore } from '@/stores/cardsStore'
import { useAssetsStore } from '@/stores/assetsStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'

function seed(): void {
  const income = useIncomeStore()
  income.setGrossSalary(6_000_000)
  // Prima = gross/2 = 3M semiannual → 500K/month equivalent.
  income.addPrimaPreset()
  useExpensesStore().add({ name: 'Arriendo', amount: 2_100_000, category: 'vivienda' })
  useVariableExpensesStore().add({ name: 'Mercado', budget: 800_000, spent: 0, categoryId: 'food' })
  const cards = useCardsStore()
  cards.addCard({
    type: 'card',
    name: 'Visa',
    balance: 1_000_000,
    limit: 5_000_000,
    apr: 24,
    minPayment: 200_000,
    dueDate: null,
    installments: [
      { id: crypto.randomUUID(), name: 'TV', total: 1_200_000, installments: 12, paid: 12 },
      { id: crypto.randomUUID(), name: 'Celular', total: 600_000, installments: 6, paid: 2 },
    ],
  })
}

describe('useNetIncome — unified monthly base', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    seed()
  })

  it('total income = net salary + prorated prima', () => {
    const { netIncome, otherStreamsMonthly, totalMonthlyIncome } = useNetIncome()
    expect(netIncome.value).toBe(6_000_000)
    expect(otherStreamsMonthly.value).toBe(500_000) // prima = gross/2 every 6 months
    expect(totalMonthlyIncome.value).toBe(6_500_000)
  })

  it('debt obligation skips the fully paid plan', () => {
    const { debtObligationsTotal } = useNetIncome()
    expect(debtObligationsTotal.value).toBe(200_000 + 100_000)
  })

  it('disponible libre = total − fixed − variable budget − debt', () => {
    const { freeForAllocation } = useNetIncome()
    expect(freeForAllocation.value).toBe(6_500_000 - 2_100_000 - 800_000 - 300_000)
  })

  it('KPI DTI and health-score DTI use the same base', () => {
    const { dti } = useDTI()
    const { metrics } = useHealthScore()
    expect(dti.value).toBeCloseTo((300_000 / 6_500_000) * 100, 6)
    expect(metrics.value.dti).toBeCloseTo(dti.value, 6)
  })

  it('housing ratio uses total monthly income (not gross)', () => {
    const { metrics } = useHealthScore()
    expect(metrics.value.housingRatio).toBeCloseTo((2_100_000 / 6_500_000) * 100, 6)
  })

  it('emergency fund counts investments and covers fixed + variable + debt', () => {
    const assets = useAssetsStore()
    assets.add({ name: 'CDT', value: 3_200_000, type: 'investment' })
    assets.add({ name: 'Ahorro', value: 6_400_000, type: 'savings' })
    assets.add({ name: 'Carro', value: 40_000_000, type: 'vehicle' })
    const { metrics } = useHealthScore()
    expect(metrics.value.emergencyMonths).toBeCloseTo(9_600_000 / 3_200_000, 6)
  })

  it('component levels follow the same cutoffs as the overall label', () => {
    const { result, componentLevels, level } = useHealthScore()
    const expected = (s: number) => (s > 60 ? 'ok' : s > 40 ? 'warn' : 'danger')
    expect(level.value).toBe(expected(result.value.score))
    expect(componentLevels.value.dti).toBe(expected(result.value.components.dti!))
    expect(componentLevels.value.housing).toBe(expected(result.value.components.housing!))
    expect(componentLevels.value.savings).toBeNull()
  })
})

describe('useCashFlowProjection — prima calendar and variable spending', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 15)) // October
    setActivePinia(createPinia())
    seed()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('prima lands in December and June; monthly flow subtracts variable budget', () => {
    const { months, startCalendarMonth } = useCashFlowProjection()
    expect(startCalendarMonth.value).toBe(9)
    const monthly = 6_000_000 - 2_100_000 - 800_000 - 300_000
    const deltas = months.value.map((m, i) =>
      i === 0 ? m.projectedBalance : m.projectedBalance - months.value[i - 1]!.projectedBalance
    )
    expect(deltas[0]).toBe(monthly) // October: no prima
    expect(deltas[2]).toBe(monthly + 3_000_000) // December
    expect(deltas[8]).toBe(monthly + 3_000_000) // June
    expect(deltas.filter((d) => d > monthly)).toHaveLength(2)
  })
})
