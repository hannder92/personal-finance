import { describe, expect, it } from 'vitest'
import { formatCurrency } from '@/lib/currency/format'
import {
  formatCompactCurrency,
  formatMonthYear,
  formatPercent,
  projectionMonthLabels,
} from '@/lib/format/locale'

const nbsp = (s: string) => s.replace(/ | /g, ' ')

describe('lib/format/locale', () => {
  it('formats percents with the app language, not the browser locale', () => {
    expect(formatPercent(36.456, 'es')).toBe('36,5%')
    expect(formatPercent(36.456, 'en')).toBe('36.5%')
    expect(formatPercent(Number.POSITIVE_INFINITY, 'es')).toBe('—')
  })

  it('formats month and year in the selected language', () => {
    const d = new Date(2028, 8, 1)
    expect(formatMonthYear(d, 'es')).toMatch(/septiembre.*2028/)
    expect(formatMonthYear(d, 'en')).toBe('September 2028')
  })

  it('builds short projection labels starting at the given calendar month', () => {
    const labels = projectionMonthLabels(2026, 10, 3, 'en')
    expect(labels).toEqual(['Nov 26', 'Dec 26', 'Jan 27'])
  })

  it('compacts large currency values for chart ticks', () => {
    expect(nbsp(formatCompactCurrency(61_900_000, 'COP'))).toMatch(/61,9/)
    expect(nbsp(formatCompactCurrency(500, 'COP'))).toMatch(/500/)
  })
})

describe('lib/currency/format — every allowed currency formats', () => {
  it.each(['COP', 'USD', 'CLP', 'MXN', 'ARS', 'BRL', 'PEN'])('%s does not throw', (code) => {
    expect(() => formatCurrency(1234.5, code)).not.toThrow()
  })
})
