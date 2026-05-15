import { describe, expect, it } from 'vitest'
import { formatCurrency, getCurrencyConfig } from '@/lib/currency/format'

describe('lib/currency/format', () => {
  it('TC-U-002a: formatCurrency(1_234_567, "COP") returns "$1.234.567" (0 decimals, no NBSP)', () => {
    expect(formatCurrency(1_234_567, 'COP')).toBe('$1.234.567')
  })

  it('TC-U-002b: USD uses 2 decimals', () => {
    expect(formatCurrency(1234.5, 'USD')).toBe('$1,234.50')
  })

  it('TC-U-002c: CLP uses 0 decimals (result has no two-decimal fragment)', () => {
    const out = formatCurrency(1_234_567, 'CLP')
    expect(out).toContain('1.234.567')
    expect(out).not.toMatch(/[.,]\d{2}\b/)
  })

  it('TC-U-002d: getCurrencyConfig("COP") returns { locale: "es-CO", decimals: 0, symbol: "$" }', () => {
    expect(getCurrencyConfig('COP')).toEqual({ locale: 'es-CO', decimals: 0, symbol: '$' })
  })
})
