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
