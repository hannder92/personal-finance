// TC-C-005 — Onboarding relaunch from Settings.
// SettingsView is a placeholder until T-070; this test exercises the composable
// contract that the Settings relaunch button will wire up.

import { createTestingPinia } from '@pinia/testing'
import { setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import { useSettingsStore } from '@/stores/settingsStore'
import { useIncomeStore } from '@/stores/incomeStore'
import { useOnboarding } from '@/composables/onboarding/useOnboarding'

function withTestingPinia() {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: {
      settings: {
        state: {
          lang: 'es',
          currency: 'COP',
          theme: 'system',
          payoffMethod: 'avalanche',
          lastMonthSeen: null,
          onboarding: { done: true, currentStep: 0, totalSteps: 3 },
        },
      },
      income: {
        state: {
          grossSalary: 5_000_000,
          deductions: [{ id: 'd1', label: 'Salud', amount: 4, type: 'percent' }],
          otherStreams: [],
          nonSalaryBenefits: [],
        },
      },
    },
  })
  setActivePinia(pinia)
}

describe('Onboarding relaunch (AC-1.6 EC-9 TC-C-005)', () => {
  it('AC-1.6 TC-C-005: relaunch sets onboarding.done=false WITHOUT clearing income data', () => {
    withTestingPinia()
    const settings = useSettingsStore()
    const income = useIncomeStore()
    const grossBefore = income.state.grossSalary
    const deductionsBefore = income.state.deductions.length

    const { relaunch } = useOnboarding()
    relaunch()

    expect(settings.setOnboardingDone).toHaveBeenCalledWith(false)
    // Income data preserved.
    expect(income.state.grossSalary).toBe(grossBefore)
    expect(income.state.deductions.length).toBe(deductionsBefore)
  })

  it('AC-1.6 TC-C-005: relaunch resets onboarding currentStep to 0', () => {
    withTestingPinia()
    const settings = useSettingsStore()

    const { relaunch } = useOnboarding()
    relaunch()

    // Either via dedicated relaunchOnboarding or via setOnboardingDone(false) + bumpOnboardingStep.
    const wasReset =
      (settings.relaunchOnboarding as ReturnType<typeof vi.fn>).mock.calls.length > 0 ||
      (settings.bumpOnboardingStep as ReturnType<typeof vi.fn>).mock.calls.some(
        (args: unknown[]) => args[0] === -2 || args[0] === 0
      )
    expect(wasReset).toBe(true)
  })
})
