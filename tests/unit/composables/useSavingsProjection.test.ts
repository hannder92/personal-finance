// Feature: 20260529-metricas-runway-ingresos · T-014 RED — GREEN in T-037
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { calcCompoundGrowth } from '@/lib/calculations/savings-projection'
import { useSavingsProjection } from '@/composables/useSavingsProjection'
import { useAssetsStore } from '@/stores/assetsStore'
import { useSettingsStore } from '@/stores/settingsStore'

function seedLiquidAssets(totalSplit: { cash?: number; savings?: number; investment?: number }) {
  const assets = useAssetsStore()
  if (totalSplit.cash) {
    assets.add({ name: 'Efectivo', value: totalSplit.cash, type: 'cash' })
  }
  if (totalSplit.savings) {
    assets.add({ name: 'Ahorros', value: totalSplit.savings, type: 'savings' })
  }
  if (totalSplit.investment) {
    assets.add({ name: 'Portafolio', value: totalSplit.investment, type: 'investment' })
  }
}

function setProjectionRate(percent: number): void {
  const settings = useSettingsStore()
  Object.assign(settings.state, { projectionAnnualRatePercent: percent })
}

describe('composables/useSavingsProjection (20260529-metricas-runway-ingresos)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('TC-U-009 (AC-6.3): compound grows when settings projectionAnnualRatePercent is 12%', () => {
    seedLiquidAssets({ investment: 10_000_000 })
    setProjectionRate(12)

    const { compound } = useSavingsProjection()
    const month11 = compound.value[11]

    expect(month11).toBeDefined()
    expect(month11!.totalValue).toBeGreaterThan(10_000_000)
  })

  it('TC-U-009 (AC-6.3): compound stays flat when settings projectionAnnualRatePercent is 0', () => {
    seedLiquidAssets({ investment: 10_000_000 })
    setProjectionRate(0)

    const { compound } = useSavingsProjection()

    expect(compound.value).toHaveLength(12)
    for (const point of compound.value) {
      expect(point.totalValue).toBe(10_000_000)
    }
  })

  it('TC-U-009 (AC-6.6): compound base is total liquid (cash + savings + investment), excluding property', () => {
    const assets = useAssetsStore()
    assets.add({ name: 'Efectivo', value: 2_000_000, type: 'cash' })
    assets.add({ name: 'Ahorros', value: 3_000_000, type: 'savings' })
    assets.add({ name: 'CDT', value: 5_000_000, type: 'investment', annualRatePercent: 0 })
    assets.add({ name: 'Casa', value: 100_000_000, type: 'property' })
    setProjectionRate(12)

    const { compound } = useSavingsProjection()
    const expected = calcCompoundGrowth([{ balance: 10_000_000, annualRatePercent: 12 }], 12)

    expect(compound.value[0]!.totalValue).toBe(expected[0]!.totalValue)
    expect(compound.value[11]!.totalValue).toBeCloseTo(expected[11]!.totalValue, -3)
  })

  it('TC-U-009 (AC-6.3, OQ-3): settings projection rate wins over per-asset annualRatePercent', () => {
    const assets = useAssetsStore()
    assets.add({
      name: 'CDT',
      value: 10_000_000,
      type: 'investment',
      annualRatePercent: 8,
    })
    setProjectionRate(10)

    const { compound } = useSavingsProjection()
    const atSettingsRate = calcCompoundGrowth([{ balance: 10_000_000, annualRatePercent: 10 }], 12)
    const atAssetRate = calcCompoundGrowth([{ balance: 10_000_000, annualRatePercent: 8 }], 12)

    expect(compound.value[11]!.totalValue).toBeCloseTo(atSettingsRate[11]!.totalValue, -3)
    expect(compound.value[11]!.totalValue).not.toBeCloseTo(atAssetRate[11]!.totalValue, -3)
  })
})
