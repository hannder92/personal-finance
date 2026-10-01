// Locale-aware number and date formatting. Every user-visible percent, date and
// chart tick goes through here so the app never falls back to the browser locale.

import { formatCurrency, getCurrencyConfig } from '@/lib/currency/format'

export type AppLang = 'es' | 'en'

export function localeForLang(lang: AppLang): string {
  return lang === 'en' ? 'en-US' : 'es-CO'
}

export function formatPercent(value: number, lang: AppLang, decimals = 1): string {
  if (!Number.isFinite(value)) return '—'
  const formatted = new Intl.NumberFormat(localeForLang(lang), {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value)
  return `${formatted}%`
}

export function formatNumber(value: number, lang: AppLang, decimals = 0): string {
  return new Intl.NumberFormat(localeForLang(lang), {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value)
}

// "septiembre de 2028" / "September 2028".
export function formatMonthYear(date: Date, lang: AppLang): string {
  return new Intl.DateTimeFormat(localeForLang(lang), { month: 'long', year: 'numeric' }).format(
    date
  )
}

// Short axis label: "oct 26" / "Oct 26".
export function formatMonthShort(date: Date, lang: AppLang): string {
  const month = new Intl.DateTimeFormat(localeForLang(lang), { month: 'short' })
    .format(date)
    .replace('.', '')
  return `${month} ${String(date.getFullYear()).slice(-2)}`
}

// Compact currency for chart axes: "$62 M" (es-CO) / "$62M" (en-US).
export function formatCompactCurrency(amount: number, code: string): string {
  const { locale } = getCurrencyConfig(code)
  if (Math.abs(amount) < 1000) return formatCurrency(amount, code)
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    currencyDisplay: 'narrowSymbol',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount)
}

// Month labels for a projection that starts at (startYear, startCalendarMonth).
export function projectionMonthLabels(
  startYear: number,
  startCalendarMonth: number,
  count: number,
  lang: AppLang
): string[] {
  return Array.from({ length: count }, (_, i) =>
    formatMonthShort(new Date(startYear, startCalendarMonth + i, 1), lang)
  )
}
