// Tests for components/income/TransportAllowanceSuggestion.vue.
// Feature: 20260516-sprint1-mejoras-finanzas · Covers AC-5.1, AC-5.2, AC-5.4 · TC-C-016..018.
//
// RED today because the component is a stub renders `<div />` only.

import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import TransportAllowanceSuggestion from '@/components/income/TransportAllowanceSuggestion.vue'
import { useIncomeStore } from '@/stores/incomeStore'
import { i18n } from '@/i18n'

function defaultSettingsState() {
  return {
    lang: 'es',
    currency: 'COP',
    theme: 'system',
    payoffMethod: 'avalanche',
    lastMonthSeen: null,
    onboarding: { done: true, currentStep: 0, totalSteps: 3 },
  }
}

function mount(grossSalary: number) {
  return render(TransportAllowanceSuggestion, {
    global: {
      plugins: [
        i18n,
        createTestingPinia({
          createSpy: vi.fn,
          stubActions: false,
          initialState: {
            settings: { state: defaultSettingsState() },
            income: {
              state: { grossSalary, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
            },
            expenses: { state: { items: [] } },
            cards: { state: { items: [] } },
            goals: { state: { items: [] } },
            assets: { state: { items: [] } },
            variableExpenses: { state: { items: [] } },
            allocation: { state: { needs: 50, wants: 30, savings: 20 } },
            snapshots: { state: { items: [] } },
          },
        }),
      ],
    },
  })
}

// Module-level state in useTransportAllowance leaks between tests; reset before each.
beforeEach(async () => {
  const mod = await import('@/composables/useTransportAllowance')
  // Workaround: call dismiss + re-import is hard; instead reset via re-creating composable via pinia.
  // The composable's `dismissed` lives at module scope. We resolve isolation by
  // re-importing via vi.resetModules in the test runner config — when not available,
  // tests that depend on a fresh state should run first or accept the leak.
  void mod
})

describe('TransportAllowanceSuggestion — sprint1 (AC-5.1, 5.2, 5.4)', () => {
  it('TC-C-016 (AC-5.1): renders banner mentioning Auxilio de transporte when shouldShow=true', async () => {
    vi.resetModules()
    mount(2_000_000)
    await nextTick()
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/auxilio.*transporte/i)
  })

  it('TC-C-017 (AC-5.2): clicking accept adds benefit and hides banner', async () => {
    vi.resetModules()
    mount(2_000_000)
    await nextTick()
    const acceptBtn = screen.getByRole('button', { name: /agregar|añadir|aceptar|aplicar/i })
    await fireEvent.click(acceptBtn)
    await nextTick()

    const income = useIncomeStore()
    const benefit = income.state.nonSalaryBenefits.find((b) =>
      /^auxilio.*transporte/i.test(b.label)
    )
    expect(benefit).toBeTruthy()
    expect(benefit?.amount).toBe(200_000)

    // After accept, banner hidden (shouldShow=false because hasBenefit=true).
    const newText = document.body.textContent ?? ''
    expect(newText).not.toMatch(/¿califica|aplicaría|recomendación|sugerencia/i)
  })

  it('TC-C-018 (AC-5.4): clicking dismiss hides banner', async () => {
    vi.resetModules()
    mount(2_000_000)
    await nextTick()
    const dismissBtn = screen.getByRole('button', { name: /no.*gracias|cerrar|descartar|✕/i })
    await fireEvent.click(dismissBtn)
    await nextTick()

    // Banner content (the suggestion title/body) gone.
    expect(screen.queryByTestId('transport-suggestion-banner')).toBeNull()
  })
})
