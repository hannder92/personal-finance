// Full impl (T-043). State shape mirrors SettingsSchema (lib/storage/schema.ts).
// Mutating actions validate inputs against the same set of allowed values.

import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { COLOMBIA_REFERENCE } from '@/lib/calculations/assumptions-reference'

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
  /** Optional display name for the dashboard greeting (≤30 chars, local only). */
  userName: string
  deductRetencion: boolean
  /** Expected annual inflation (%), 0–30. The expected return is projectionAnnualRatePercent. */
  inflationPercent: number
  /** Safe withdrawal rate (%) for financial freedom, 1–10. */
  withdrawalRatePercent: number
  /** Horizon (whole years, 5–40) for the FI required monthly contribution. */
  fiDesiredYears: number
}

export const useSettingsStore = defineStore('settings', () => {
  const state = reactive<SettingsState>({
    lang: 'es',
    currency: 'COP',
    theme: 'system',
    payoffMethod: 'avalanche',
    lastMonthSeen: null,
    projectionAnnualRatePercent: 0,
    userName: '',
    deductRetencion: true,
    inflationPercent: 0,
    withdrawalRatePercent: 4,
    fiDesiredYears: 20,
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
  // Mirrors SettingsSchemaV5.userName (max 30). Trims; rejects (no-op) above the cap
  // so the persisted payload can never fail schema validation.
  function setUserName(name: string): void {
    const trimmed = name.trim()
    if (trimmed.length > 30) return
    state.userName = trimmed
  }
  function setDeductRetencion(value: boolean): void {
    if (typeof value !== 'boolean') return
    state.deductRetencion = value
  }

  // Ranges mirror SettingsSchemaV7 so the persisted payload never fails validation.
  function setInflationPercent(rate: number): void {
    if (!Number.isFinite(rate) || rate < 0 || rate > 30) return
    state.inflationPercent = rate
  }
  function setWithdrawalRatePercent(rate: number): void {
    if (!Number.isFinite(rate) || rate < 1 || rate > 10) return
    state.withdrawalRatePercent = rate
  }
  function setFiDesiredYears(years: number): void {
    if (!Number.isInteger(years) || years < 5 || years > 40) return
    state.fiDesiredYears = years
  }
  function applyColombiaReference(): void {
    setInflationPercent(COLOMBIA_REFERENCE.inflationPercent)
    setProjectionAnnualRatePercent(COLOMBIA_REFERENCE.annualReturnPercent)
    setWithdrawalRatePercent(COLOMBIA_REFERENCE.withdrawalRatePercent)
  }

  return {
    state,
    setInflationPercent,
    setWithdrawalRatePercent,
    setFiDesiredYears,
    applyColombiaReference,
    setDeductRetencion,
    setLang,
    setCurrency,
    setTheme,
    setPayoffMethod,
    setLastMonthSeen,
    setProjectionAnnualRatePercent,
    setUserName,
  }
})
