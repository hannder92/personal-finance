import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useCardsStore } from '@/stores/cardsStore'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

describe('cardsStore (T-045)', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('addCard appends a card with UUID id and discriminator type="card"', () => {
    const s = useCardsStore()
    s.addCard({
      type: 'card',
      name: 'Visa Oro',
      balance: 2_000_000,
      limit: 5_000_000,
      apr: 24,
      minPayment: 100_000,
      dueDate: null,
      installments: [],
    })
    expect(s.state.items.length).toBe(1)
    expect(s.state.items[0]!.id).toMatch(UUID)
    expect(s.state.items[0]!.type).toBe('card')
  })

  it('addLoan appends a loan with UUID id and discriminator type="loan"', () => {
    const s = useCardsStore()
    s.addLoan({
      type: 'loan',
      name: 'Crédito vehículo',
      balance: 8_000_000,
      apr: 18,
      minPayment: 500_000,
      remainingInstallments: 18,
    })
    expect(s.state.items.length).toBe(1)
    expect(s.state.items[0]!.type).toBe('loan')
  })

  it('addCard rejects negative balance', () => {
    const s = useCardsStore()
    s.addCard({
      type: 'card',
      name: 'X',
      balance: -1,
      limit: 100,
      apr: 12,
      minPayment: 10,
      dueDate: null,
      installments: [],
    })
    expect(s.state.items.length).toBe(0)
  })

  it('remove deletes by id', () => {
    const s = useCardsStore()
    s.addCard({
      type: 'card',
      name: 'A',
      balance: 0,
      limit: 100,
      apr: 0,
      minPayment: 0,
      dueDate: null,
      installments: [],
    })
    const id = s.state.items[0]!.id
    s.remove(id)
    expect(s.state.items.length).toBe(0)
  })

  it('addInstallment appends to card.installments with UUID', () => {
    const s = useCardsStore()
    s.addCard({
      type: 'card',
      name: 'A',
      balance: 0,
      limit: 100,
      apr: 0,
      minPayment: 0,
      dueDate: null,
      installments: [],
    })
    const cardId = s.state.items[0]!.id
    s.addInstallment(cardId, { name: 'TV', total: 1_200_000, installments: 12, paid: 0 })
    const card = s.state.items[0]!
    expect(card.type === 'card' && card.installments.length === 1).toBe(true)
    if (card.type === 'card') expect(card.installments[0]!.id).toMatch(UUID)
  })

  it('incrementPaid increases paid count, never above total', () => {
    const s = useCardsStore()
    s.addCard({
      type: 'card',
      name: 'A',
      balance: 0,
      limit: 100,
      apr: 0,
      minPayment: 0,
      dueDate: null,
      installments: [],
    })
    const cardId = s.state.items[0]!.id
    s.addInstallment(cardId, { name: 'TV', total: 1_200_000, installments: 3, paid: 0 })
    const card = s.state.items[0]!
    if (card.type !== 'card') throw new Error('expected card')
    const instId = card.installments[0]!.id

    s.incrementPaid(cardId, instId)
    expect(card.installments[0]!.paid).toBe(1)
    s.incrementPaid(cardId, instId)
    s.incrementPaid(cardId, instId)
    s.incrementPaid(cardId, instId) // beyond total
    expect(card.installments[0]!.paid).toBeLessThanOrEqual(card.installments[0]!.installments)
  })

  it('removeInstallment removes from card.installments', () => {
    const s = useCardsStore()
    s.addCard({
      type: 'card',
      name: 'A',
      balance: 0,
      limit: 100,
      apr: 0,
      minPayment: 0,
      dueDate: null,
      installments: [],
    })
    const cardId = s.state.items[0]!.id
    s.addInstallment(cardId, { name: 'TV', total: 1_200_000, installments: 12, paid: 0 })
    const card = s.state.items[0]!
    if (card.type !== 'card') throw new Error('expected card')
    const instId = card.installments[0]!.id

    s.removeInstallment(cardId, instId)
    expect(card.installments.length).toBe(0)
  })

  it('updateInstallment patches existing installment fields', () => {
    const s = useCardsStore()
    s.addCard({
      type: 'card',
      name: 'A',
      balance: 0,
      limit: 100,
      apr: 0,
      minPayment: 0,
      dueDate: null,
      installments: [],
    })
    const cardId = s.state.items[0]!.id
    s.addInstallment(cardId, { name: 'TV', total: 1_200_000, installments: 12, paid: 0 })
    const card = s.state.items[0]!
    if (card.type !== 'card') throw new Error('expected card')
    const instId = card.installments[0]!.id

    s.updateInstallment(cardId, instId, { paid: 5 })
    expect(card.installments[0]!.paid).toBe(5)
  })
})
