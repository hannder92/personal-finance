import { describe, expect, it } from 'vitest'
import { detectMonthRollover, formatYearMonth, getMonthToClose } from '@/lib/date/month'

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

  describe('getMonthToClose', () => {
    it('returns the last seen month when the calendar moved forward', () => {
      expect(getMonthToClose('2026-09', '2026-10')).toBe('2026-09')
    })

    it('returns the last seen month across a year boundary', () => {
      expect(getMonthToClose('2025-12', '2026-01')).toBe('2025-12')
    })

    it('returns null within the same month', () => {
      expect(getMonthToClose('2026-10', '2026-10')).toBeNull()
    })

    it('returns null on first run (no month seen yet)', () => {
      expect(getMonthToClose(null, '2026-10')).toBeNull()
    })

    it('returns null when the clock went backwards', () => {
      expect(getMonthToClose('2026-11', '2026-10')).toBeNull()
    })
  })
})
