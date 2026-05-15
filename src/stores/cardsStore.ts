// Full impl (T-045). UUID v4 IDs + boundary validation + installment management.

import { defineStore } from 'pinia'
import { reactive } from 'vue'

export interface Installment {
  id: string
  name: string
  total: number
  installments: number
  paid: number
  monthly?: number
}

export interface CardDebt {
  id: string
  type: 'card'
  name: string
  balance: number
  limit: number
  apr: number
  minPayment: number
  dueDate: string | null
  installments: Installment[]
}

export interface LoanDebt {
  id: string
  type: 'loan'
  name: string
  balance: number
  apr: number
  minPayment: number
  remainingInstallments: number
  installments?: Installment[]
}

export type Debt = CardDebt | LoanDebt

export interface CardsState {
  items: Debt[]
}

function newId(): string {
  return globalThis.crypto.randomUUID()
}

function isValidName(name: string): boolean {
  return typeof name === 'string' && name.length > 0 && name.length <= 60
}

function isValidAmount(n: number): boolean {
  return Number.isFinite(n) && n >= 0
}

export const useCardsStore = defineStore('cards', () => {
  const state = reactive<CardsState>({ items: [] })

  function addCard(input: Omit<CardDebt, 'id'>): void {
    if (!isValidName(input.name)) return
    if (!isValidAmount(input.balance)) return
    if (!isValidAmount(input.limit)) return
    if (!isValidAmount(input.apr)) return
    if (!isValidAmount(input.minPayment)) return
    state.items.push({ ...input, id: newId() })
  }

  function addLoan(input: Omit<LoanDebt, 'id'>): void {
    if (!isValidName(input.name)) return
    if (!isValidAmount(input.balance)) return
    if (!isValidAmount(input.apr)) return
    if (!isValidAmount(input.minPayment)) return
    if (!Number.isInteger(input.remainingInstallments) || input.remainingInstallments < 0) return
    state.items.push({ ...input, id: newId() })
  }

  function update(id: string, patch: Partial<Debt>): void {
    const idx = state.items.findIndex((x) => x.id === id)
    if (idx < 0) return
    Object.assign(state.items[idx]!, patch)
  }

  function remove(id: string): void {
    const idx = state.items.findIndex((x) => x.id === id)
    if (idx >= 0) state.items.splice(idx, 1)
  }

  function findCard(cardId: string): CardDebt | undefined {
    const item = state.items.find((x) => x.id === cardId)
    return item?.type === 'card' ? item : undefined
  }

  function addInstallment(cardId: string, input: Omit<Installment, 'id'>): void {
    const card = findCard(cardId)
    if (!card) return
    if (!isValidName(input.name)) return
    if (!isValidAmount(input.total)) return
    if (!Number.isInteger(input.installments) || input.installments <= 0) return
    if (!Number.isInteger(input.paid) || input.paid < 0 || input.paid > input.installments) return
    card.installments.push({ ...input, id: newId() })
  }

  function updateInstallment(
    cardId: string,
    id: string,
    patch: Partial<Omit<Installment, 'id'>>
  ): void {
    const card = findCard(cardId)
    if (!card) return
    const item = card.installments.find((x) => x.id === id)
    if (!item) return
    Object.assign(item, patch)
  }

  function removeInstallment(cardId: string, id: string): void {
    const card = findCard(cardId)
    if (!card) return
    const idx = card.installments.findIndex((x) => x.id === id)
    if (idx >= 0) card.installments.splice(idx, 1)
  }

  function incrementPaid(cardId: string, id: string): void {
    const card = findCard(cardId)
    if (!card) return
    const item = card.installments.find((x) => x.id === id)
    if (!item) return
    if (item.paid < item.installments) item.paid += 1
  }

  return {
    state,
    addCard,
    addLoan,
    update,
    remove,
    addInstallment,
    updateInstallment,
    removeInstallment,
    incrementPaid,
  }
})
