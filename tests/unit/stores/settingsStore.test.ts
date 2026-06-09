import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useSettingsStore } from '@/stores/settingsStore'

describe('settingsStore (T-043)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('setLang mutates state when valid', () => {
    const s = useSettingsStore()
    s.setLang('en')
    expect(s.state.lang).toBe('en')
  })

  it('setTheme mutates state when valid', () => {
    const s = useSettingsStore()
    s.setTheme('dark')
    expect(s.state.theme).toBe('dark')
  })

  it('setCurrency mutates state when valid', () => {
    const s = useSettingsStore()
    s.setCurrency('USD')
    expect(s.state.currency).toBe('USD')
  })

  it('setPayoffMethod mutates state when valid', () => {
    const s = useSettingsStore()
    s.setPayoffMethod('snowball')
    expect(s.state.payoffMethod).toBe('snowball')
  })

  it('setLastMonthSeen accepts YYYY-MM string', () => {
    const s = useSettingsStore()
    s.setLastMonthSeen('2026-05')
    expect(s.state.lastMonthSeen).toBe('2026-05')
  })
})

// T-005 — Covers: AC-1.3, EC-2 · TC-U-003
describe('settingsStore.setUserName (TC-U-003)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('stores a trimmed name up to 30 chars', () => {
    const s = useSettingsStore()
    s.setUserName('  Johann  ')
    expect(s.state.userName).toBe('Johann')
  })

  it('rejects names longer than 30 chars leaving state unchanged (EC-2)', () => {
    const s = useSettingsStore()
    s.setUserName('Johann')
    s.setUserName('x'.repeat(31))
    expect(s.state.userName).toBe('Johann')
  })

  it('clears the name with an empty string (back to generic greeting)', () => {
    const s = useSettingsStore()
    s.setUserName('Johann')
    s.setUserName('')
    expect(s.state.userName).toBe('')
  })

  it('defaults to empty string (optional field)', () => {
    const s = useSettingsStore()
    expect(s.state.userName).toBe('')
  })
})

describe('settingsStore (20260529-metricas-runway-ingresos)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('TC-U-006 (AC-6.2): setProjectionAnnualRatePercent persists valid rate', () => {
    const s = useSettingsStore()
    s.setProjectionAnnualRatePercent(10)
    expect(s.state.projectionAnnualRatePercent).toBe(10)
  })

  it('TC-U-006 (AC-6.2): setProjectionAnnualRatePercent rejects out-of-range values', () => {
    const s = useSettingsStore()
    s.setProjectionAnnualRatePercent(5)
    s.setProjectionAnnualRatePercent(150)
    expect(s.state.projectionAnnualRatePercent).toBe(5)
    s.setProjectionAnnualRatePercent(-1)
    expect(s.state.projectionAnnualRatePercent).toBe(5)
  })
})
