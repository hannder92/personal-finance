import { computed, type ComputedRef } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'

export interface OnboardingApi {
  currentStep: ComputedRef<number>
  totalSteps: ComputedRef<number>
  next: () => void
  prev: () => void
  skip: () => void
  finish: () => void
  relaunch: () => void
}

export function useOnboarding(): OnboardingApi {
  const settings = useSettingsStore()
  const currentStep = computed(() => settings.state.onboarding.currentStep)
  const totalSteps = computed(() => settings.state.onboarding.totalSteps)

  return {
    currentStep,
    totalSteps,
    next: () => settings.bumpOnboardingStep(1),
    prev: () => settings.bumpOnboardingStep(-1),
    skip: () => settings.setOnboardingDone(true),
    finish: () => settings.setOnboardingDone(true),
    relaunch: () => {
      settings.setOnboardingDone(false)
      settings.relaunchOnboarding()
    },
  }
}
