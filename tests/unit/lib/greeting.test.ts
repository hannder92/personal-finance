// T-004 — Covers: AC-1.1, AC-1.2 · TC-U-001, TC-U-002
import { describe, expect, it } from 'vitest'
import { greetingKey } from '@/lib/greeting'

describe('greetingKey (TC-U-001, TC-U-002)', () => {
  it('TC-U-001: returns morning for 8:00 (AC-1.1)', () => {
    expect(greetingKey(8)).toBe('morning')
  })

  it('TC-U-002: exact slot boundaries 5/12/19', () => {
    expect(greetingKey(4)).toBe('evening')
    expect(greetingKey(5)).toBe('morning')
    expect(greetingKey(11)).toBe('morning')
    expect(greetingKey(12)).toBe('afternoon')
    expect(greetingKey(18)).toBe('afternoon')
    expect(greetingKey(19)).toBe('evening')
    expect(greetingKey(23)).toBe('evening')
    expect(greetingKey(0)).toBe('evening')
  })

  it('TC-U-002: evening slot for 20:00 (AC-1.2 fixture)', () => {
    expect(greetingKey(20)).toBe('evening')
  })
})
