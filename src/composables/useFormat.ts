// Formatting bound to the app's language and currency settings.

import { formatCurrency } from '@/lib/currency/format'
import {
  formatCompactCurrency,
  formatMonthYear,
  formatNumber,
  formatPercent,
} from '@/lib/format/locale'
import { useSettingsStore } from '@/stores/settingsStore'

export function useFormat() {
  const settings = useSettingsStore()
  return {
    currency: (amount: number) => formatCurrency(amount, settings.state.currency),
    compactCurrency: (amount: number) => formatCompactCurrency(amount, settings.state.currency),
    percent: (value: number, decimals = 1) => formatPercent(value, settings.state.lang, decimals),
    number: (value: number, decimals = 0) => formatNumber(value, settings.state.lang, decimals),
    monthYear: (date: Date) => formatMonthYear(date, settings.state.lang),
  }
}
