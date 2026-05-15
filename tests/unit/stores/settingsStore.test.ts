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

  it('setOnboardingDone toggles flag', () => {
    const s = useSettingsStore()
    s.setOnboardingDone(true)
    expect(s.state.onboarding.done).toBe(true)
  })

  it('bumpOnboardingStep clamps to [0, totalSteps-1]', () => {
    const s = useSettingsStore()
    s.bumpOnboardingStep(5) // out-of-range positive
    expect(s.state.onboarding.currentStep).toBe(s.state.onboarding.totalSteps - 1)

    s.bumpOnboardingStep(-99) // out-of-range negative
    expect(s.state.onboarding.currentStep).toBe(0)
  })

  it('relaunchOnboarding resets to step 0 (done is set elsewhere)', () => {
    const s = useSettingsStore()
    s.bumpOnboardingStep(1)
    expect(s.state.onboarding.currentStep).toBe(1)
    s.relaunchOnboarding()
    expect(s.state.onboarding.currentStep).toBe(0)
  })

  it('setLastMonthSeen accepts YYYY-MM string', () => {
    const s = useSettingsStore()
    s.setLastMonthSeen('2026-05')
    expect(s.state.lastMonthSeen).toBe('2026-05')
  })
})
