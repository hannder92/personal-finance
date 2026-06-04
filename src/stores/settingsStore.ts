// Full impl (T-043). State shape mirrors SettingsSchema (lib/storage/schema.ts).
// Mutating actions validate inputs against the same set of allowed values.

import { defineStore } from 'pinia'
import { reactive } from 'vue'

const ALLOWED_LANGS = ['es', 'en'] as const
const ALLOWED_CURRENCIES = ['COP', 'USD', 'CLP', 'MXN', 'ARS', 'BRL', 'PEN'] as const
const ALLOWED_THEMES = ['system', 'light', 'dark'] as const
const ALLOWED_PAYOFFS = ['avalanche', 'snowball'] as const
const YEAR_MONTH = /^\d{4}-\d{2}$/

export interface SettingsState {
  lang: 'es' | 'en'
  currency: 'COP' | 'USD' | 'CLP' | 'MXN' | 'ARS' | 'BRL' | 'PEN'
  theme: 'system' | 'light' | 'dark'
  payoffMethod: 'avalanche' | 'snowball'
  lastMonthSeen: string | null
  projectionAnnualRatePercent: number
}

export const useSettingsStore = defineStore('settings', () => {
  const state = reactive<SettingsState>({
    lang: 'es',
    currency: 'COP',
    theme: 'system',
    payoffMethod: 'avalanche',
    lastMonthSeen: null,
    projectionAnnualRatePercent: 0,
  })

  function setLang(lang: SettingsState['lang']): void {
    if (!ALLOWED_LANGS.includes(lang)) return
    state.lang = lang
  }
  function setCurrency(currency: SettingsState['currency']): void {
    if (!ALLOWED_CURRENCIES.includes(currency)) return
    state.currency = currency
  }
  function setTheme(theme: SettingsState['theme']): void {
    if (!ALLOWED_THEMES.includes(theme)) return
    state.theme = theme
  }
  function setPayoffMethod(method: SettingsState['payoffMethod']): void {
    if (!ALLOWED_PAYOFFS.includes(method)) return
    state.payoffMethod = method
  }
  function setLastMonthSeen(iso: string): void {
    if (!YEAR_MONTH.test(iso)) return
    state.lastMonthSeen = iso
  }
  function setProjectionAnnualRatePercent(rate: number): void {
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) return
    state.projectionAnnualRatePercent = rate
  }

  return {
    state,
    setLang,
    setCurrency,
    setTheme,
    setPayoffMethod,
    setLastMonthSeen,
    setProjectionAnnualRatePercent,
  }
})
