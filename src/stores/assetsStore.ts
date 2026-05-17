// Full impl (T-046). UUID v4 + boundary validation.

import { defineStore } from 'pinia'
import { reactive } from 'vue'

export type AssetType = 'savings' | 'investment' | 'property' | 'vehicle' | 'other'
const ALLOWED_TYPES: AssetType[] = ['savings', 'investment', 'property', 'vehicle', 'other']

export interface Asset {
  id: string
  name: string
  value: number
  type: AssetType
  /** Annual rate (TEA, %) for compound growth projection. Range [0, 100]. Default 0. */
  annualRatePercent: number
}

export interface AssetsState {
  items: Asset[]
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

function isValidRate(n: number): boolean {
  return Number.isFinite(n) && n >= 0 && n <= 100
}

export const useAssetsStore = defineStore('assets', () => {
  const state = reactive<AssetsState>({ items: [] })

  function add(input: Omit<Asset, 'id' | 'annualRatePercent'> & { annualRatePercent?: number }): void {
    if (!isValidName(input.name)) return
    if (!isValidAmount(input.value)) return
    if (!ALLOWED_TYPES.includes(input.type)) return
    if (input.annualRatePercent !== undefined && !isValidRate(input.annualRatePercent)) return
    state.items.push({
      ...input,
      annualRatePercent: input.annualRatePercent ?? 0,
      id: newId(),
    })
  }
  function remove(id: string): void {
    const idx = state.items.findIndex((x) => x.id === id)
    if (idx >= 0) state.items.splice(idx, 1)
  }
  function update(id: string, patch: Partial<Omit<Asset, 'id'>>): void {
    const item = state.items.find((x) => x.id === id)
    if (!item) return
    if (patch.name !== undefined && !isValidName(patch.name)) return
    if (patch.value !== undefined && !isValidAmount(patch.value)) return
    if (patch.type !== undefined && !ALLOWED_TYPES.includes(patch.type)) return
    if (patch.annualRatePercent !== undefined && !isValidRate(patch.annualRatePercent)) return
    Object.assign(item, patch)
  }

  return { state, add, remove, update }
})
