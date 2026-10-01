export interface CurrencyConfig {
  locale: string
  decimals: number
  symbol: string
}

const CONFIGS: Readonly<Record<string, CurrencyConfig>> = {
  COP: { locale: 'es-CO', decimals: 0, symbol: '$' },
  USD: { locale: 'en-US', decimals: 2, symbol: '$' },
  CLP: { locale: 'es-CL', decimals: 0, symbol: '$' },
  MXN: { locale: 'es-MX', decimals: 2, symbol: '$' },
  ARS: { locale: 'es-AR', decimals: 2, symbol: '$' },
  BRL: { locale: 'pt-BR', decimals: 2, symbol: 'R$' },
  PEN: { locale: 'es-PE', decimals: 2, symbol: 'S/' },
}

export function getCurrencyConfig(code: string): CurrencyConfig {
  const config = CONFIGS[code]
  if (!config) throw new Error(`Unknown currency code: ${code}`)
  return config
}

export function formatCurrency(amount: number, code: string): string {
  const { locale, decimals } = getCurrencyConfig(code)
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
  // Some locales (es-CO) insert a non-breaking space between the symbol and the digits.
  // The test plan specifies "$1.234.567" with no separator.
  return formatted.replace(/ /g, '')
}
