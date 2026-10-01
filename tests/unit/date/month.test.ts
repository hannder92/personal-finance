import { describe, expect, it } from 'vitest'
import { detectMonthRollover, formatYearMonth } from '@/lib/date/month'

describe('lib/date/month', () => {
  describe('detectMonthRollover', () => {
    it('TC-U-053 (AC-8.4, AC-13.1): returns true when last seen month differs from current', () => {
      expect(detectMonthRollover('2026-04', '2026-05')).toBe(true)
    })

    it('TC-U-054 (AC-13.1): returns false when last seen month equals current', () => {
      expect(detectMonthRollover('2026-05', '2026-05')).toBe(false)
    })

    it('AC-13.1: returns true across a year boundary (Dec → Jan)', () => {
      expect(detectMonthRollover('2025-12', '2026-01')).toBe(true)
    })
  })

  describe('formatYearMonth', () => {
    it('formats a Date to YYYY-MM (zero-padded)', () => {
      expect(formatYearMonth(new Date(2026, 4, 15))).toBe('2026-05')
    })

    it('zero-pads single-digit months', () => {
      expect(formatYearMonth(new Date(2026, 0, 1))).toBe('2026-01')
    })
  })
})
