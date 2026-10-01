import { describe, expect, it } from 'vitest'
import {
  DASHBOARD_TIER2_SESSION_KEY,
  computeTier2State,
  readTier2Expanded,
  writeTier2Expanded,
} from '@/lib/dashboard-tier2-storage'

function mockStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear() {
      map.clear()
    },
    getItem(key: string) {
      return map.get(key) ?? null
    },
    key(index: number) {
      return [...map.keys()][index] ?? null
    },
    removeItem(key: string) {
      map.delete(key)
    },
    setItem(key: string, value: string) {
      map.set(key, value)
    },
  }
}

describe('dashboard-tier2-storage (20260604-dashboard-progressive-disclosure)', () => {
  it('TC-U-020 (AC-1.1, AC-3.2): read empty session as collapsed', () => {
    expect(readTier2Expanded(mockStorage())).toBe(false)
  })

  it('TC-U-020 (AC-3.2): read expanded from session', () => {
    const session = mockStorage()
    session.setItem(DASHBOARD_TIER2_SESSION_KEY, 'true')
    expect(readTier2Expanded(session)).toBe(true)
  })

  it('TC-U-020 (AC-3.1): write expanded to session', () => {
    const session = mockStorage()
    writeTier2Expanded(session, true)
    expect(session.getItem(DASHBOARD_TIER2_SESSION_KEY)).toBe('true')
  })

  it('TC-U-021 (AC-1.1): mobile collapsed hides tier 2', () => {
    const state = computeTier2State({ isDesktop: false, hasIncome: true, isExpanded: false })
    expect(state.tier2Visible).toBe(false)
    expect(state.canToggle).toBe(true)
  })

  it('TC-U-024 (AC-4.1, AC-4.2): desktop always visible without toggle', () => {
    const state = computeTier2State({ isDesktop: true, hasIncome: true, isExpanded: false })
    expect(state.tier2Visible).toBe(true)
    expect(state.canToggle).toBe(false)
  })

  it('TC-U-025 (AC-5.1): no income forces collapse', () => {
    const state = computeTier2State({ isDesktop: false, hasIncome: false, isExpanded: true })
    expect(state.tier2Visible).toBe(false)
    expect(state.canToggle).toBe(false)
  })

  it('TC-U-027 (EC-2): mobile respects collapsed session', () => {
    const state = computeTier2State({ isDesktop: false, hasIncome: true, isExpanded: false })
    expect(state.tier2Visible).toBe(false)
  })

  it('TC-U-026 (AC-3.2): write only touches session key', () => {
    const session = mockStorage()
    const local = mockStorage()
    local.setItem('finance_app_data', '{"schemaVersion":2}')
    writeTier2Expanded(session, true)
    expect(session.getItem(DASHBOARD_TIER2_SESSION_KEY)).toBe('true')
    expect(local.getItem('finance_app_data')).toBe('{"schemaVersion":2}')
  })
})
