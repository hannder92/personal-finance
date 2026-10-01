import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, beforeEach } from 'vitest'
import { useDayOverview } from '@/composables/useDayOverview'
import { useAssetsStore } from '@/stores/assetsStore'
import { useCardsStore } from '@/stores/cardsStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'

const TODAY = new Date(2026, 5, 4, 12, 0, 0)

describe('useDayOverview (20260530-mi-dia-cobertura)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('TC-I-010 (AC-1.1, AC-2.1): coverage covered with payments today', () => {
    const cards = useCardsStore()
    const assets = useAssetsStore()
    useExpensesStore()
    useVariableExpensesStore()

    cards.addCard({
      type: 'card',
      name: 'Visa',
      balance: 0,
      limit: 1_000_000,
      apr: 0,
      minPayment: 200_000,
      dueDate: '2026-06-04',
      installments: [],
    })
    assets.state.items.push({
      id: 'a1',
      name: 'Cash',
      value: 800_000,
      type: 'cash',
      annualRatePercent: 0,
    })

    const { coverage, paymentsToday } = useDayOverview({ today: TODAY })
    expect(coverage.value.status).toBe('covered')
    expect(paymentsToday.value).toHaveLength(1)
  })
})
