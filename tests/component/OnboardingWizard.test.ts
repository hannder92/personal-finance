import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import OnboardingWizard from '@/components/onboarding/OnboardingWizard.vue'
import { useSettingsStore } from '@/stores/settingsStore'

function mount(initial: Record<string, unknown> = {}) {
  return render(OnboardingWizard, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            settings: {
              state: {
                lang: 'es',
                currency: 'COP',
                theme: 'system',
                payoffMethod: 'avalanche',
                lastMonthSeen: null,
                onboarding: { done: false, currentStep: 0, totalSteps: 3 },
              },
            },
            income: {
              state: {
                grossSalary: 0,
                deductions: [],
                otherStreams: [],
                nonSalaryBenefits: [],
              },
            },
            ...initial,
          },
        }),
      ],
    },
  })
}

describe('OnboardingWizard (AC-1.1 AC-1.2 TC-C-001)', () => {
  it('AC-1.1 TC-C-001: shows step 1 content and StepIndicator 1/3 on first mount', () => {
    mount()
    expect(screen.getByText(/1\s*\/\s*3/)).toBeTruthy()
    // Step 1 = ingresos. Heading should reference salary/ingreso.
    expect(screen.getByRole('heading', { name: /ingreso|salario|salary|income/i })).toBeTruthy()
  })

  it('AC-1.2 TC-C-001: clicking "Siguiente" advances StepIndicator to 2/3', async () => {
    mount()
    const settings = useSettingsStore()

    const nextBtn = screen.getByRole('button', { name: /siguiente|next/i })
    await fireEvent.click(nextBtn)

    expect(settings.bumpOnboardingStep).toHaveBeenCalledWith(1)
  })
})

describe('OnboardingWizard (AC-1.3 EC-9 TC-C-002)', () => {
  it('AC-1.3 TC-C-002: pre-fills grossSalary when income data already exists', () => {
    mount({
      settings: {
        state: {
          lang: 'es',
          currency: 'COP',
          theme: 'system',
          payoffMethod: 'avalanche',
          lastMonthSeen: null,
          onboarding: { done: false, currentStep: 1, totalSteps: 3 },
        },
      },
      income: {
        state: { grossSalary: 5_000_000, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
      },
    })

    const grossInput = screen.getByRole('textbox', {
      name: /salario|gross|bruto/i,
    }) as HTMLInputElement
    expect(grossInput.value).toMatch(/5\.000\.000|5000000/)
  })
})

describe('OnboardingWizard (AC-1.4 TC-C-003)', () => {
  it('AC-1.4 TC-C-003: clicking "Saltar" sets onboarding.done=true via store action', async () => {
    mount()
    const settings = useSettingsStore()

    const skipBtn = screen.getByRole('button', { name: /saltar|skip/i })
    await fireEvent.click(skipBtn)

    expect(settings.setOnboardingDone).toHaveBeenCalledWith(true)
  })
})

describe('OnboardingWizard (AC-1.5 TC-C-004)', () => {
  it('AC-1.5 TC-C-004: "Finalizar" on last step sets onboarding.done=true', async () => {
    mount({
      settings: {
        state: {
          lang: 'es',
          currency: 'COP',
          theme: 'system',
          payoffMethod: 'avalanche',
          lastMonthSeen: null,
          onboarding: { done: false, currentStep: 2, totalSteps: 3 },
        },
      },
    })
    const settings = useSettingsStore()

    const finishBtn = screen.getByRole('button', { name: /finalizar|finish/i })
    await fireEvent.click(finishBtn)

    expect(settings.setOnboardingDone).toHaveBeenCalledWith(true)
  })
})
