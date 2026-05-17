// Bridges cardsStore + netIncome composable to compute DTI as a percentage.
// Includes installments in card obligation (calcCardObligation) per AC-4.2.

import { computed, type ComputedRef } from 'vue'
import { calcDTI } from '@/lib/calculations/dti'
import { calcCardObligation } from '@/lib/calculations/installments'
import { useCardsStore } from '@/stores/cardsStore'
import { useNetIncome } from './useNetIncome'

export interface UseDTI {
  dti: ComputedRef<number>
  totalDebtObligation: ComputedRef<number>
}

export function useDTI(): UseDTI {
  const cards = useCardsStore()
  const { netIncome } = useNetIncome()

  const totalDebtObligation = computed(() =>
    cards.state.items.reduce((acc, c) => {
      if (c.type === 'card') {
        return acc + calcCardObligation({ minPayment: c.minPayment, installmentsList: c.installments })
      }
      return acc + c.minPayment
    }, 0)
  )

  const dti = computed(() => calcDTI(totalDebtObligation.value, netIncome.value))

  return { dti, totalDebtObligation }
}
