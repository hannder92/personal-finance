// Feature: 20261002-proyecciones-reales · T-007
import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed } from 'vue'
import AssumptionsPanel from '@/components/settings/AssumptionsPanel.vue'
import GoalCard from '@/components/goals/GoalCard.vue'
import GoalList from '@/components/goals/GoalList.vue'
import FinancialFreedomView from '@/views/FinancialFreedomView.vue'
import { i18n } from '@/i18n'
import { useGoalsStore } from '@/stores/goalsStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { Goal } from '@/stores/goalsStore'

const liquid = { assets: 50_000_000, expense: 4_000_000 }
const feasibleSavings = { value: 2_000_000 }

vi.mock('@/composables/useLiquidMetrics', () => ({
  useLiquidMetrics: () => ({
    liquidAssets: computed(() => liquid.assets),
    monthlyLivingExpense: computed(() => liquid.expense),
  }),
}))
vi.mock('@/composables/useSavingsFeasibility', () => ({
  useSavingsFeasibility: () => ({
    feasible: computed(() => feasibleSavings.value),
    objective: computed(() => 0),
    effectiveGoalCap: computed(() => 0),
  }),
}))
vi.mock('@/components/fi/FlowCoverageBlock.vue', () => ({ default: { template: '<div />' } }))

function settingsState(overrides: Record<string, unknown> = {}) {
  return {
    lang: 'es',
    currency: 'COP',
    theme: 'system',
    payoffMethod: 'avalanche',
    lastMonthSeen: null,
    projectionAnnualRatePercent: 9,
    userName: '',
    deductRetencion: true,
    inflationPercent: 5,
    withdrawalRatePercent: 4,
    fiDesiredYears: 20,
    ...overrides,
  }
}

function plugins(settings: Record<string, unknown> = {}, goals: Goal[] = []) {
  return [
    i18n,
    createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        settings: { state: settingsState(settings) },
        goals: { state: { items: goals } },
      },
    }),
  ]
}

// Spec example (US-3): 100M today, 20M saved, 1.5M/month, target 60 months from 2026-10.
function exampleGoal(invested: boolean): Goal {
  return {
    id: 'g1',
    name: 'Casa',
    target: 100_000_000,
    saved: 20_000_000,
    monthlyContrib: 1_500_000,
    targetDate: '2031-10-15',
    priority: 0,
    invested,
  }
}

const stubs = { RouterLink: { template: '<a><slot /></a>' } }

const text = () => document.body.textContent?.replace(/\s+/g, ' ') ?? ''

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 2, 12))
  i18n.global.locale.value = 'es'
  feasibleSavings.value = 2_000_000
})
afterEach(() => {
  vi.useRealTimers()
})

describe('AssumptionsPanel (US-1)', () => {
  it('TC-C-001 (AC-1.1): shows neutral values with the existing projection rate', () => {
    render(AssumptionsPanel, {
      global: { plugins: plugins({ inflationPercent: 0, projectionAnnualRatePercent: 6 }) },
    })
    expect((screen.getByTestId('assumption-inflation') as HTMLInputElement).value).toBe('0')
    expect((screen.getByTestId('assumption-return') as HTMLInputElement).value).toBe('6')
    expect((screen.getByTestId('assumption-withdrawal') as HTMLInputElement).value).toBe('4')
    expect(screen.getByTestId('assumptions-suggestion')).toBeTruthy()
  })

  it('TC-C-002 (AC-1.2): reference button fills 5 / 9 / 4 and shows the source', async () => {
    render(AssumptionsPanel, {
      global: { plugins: plugins({ inflationPercent: 0, projectionAnnualRatePercent: 0 }) },
    })
    await fireEvent.click(screen.getByTestId('assumptions-use-reference'))
    const settings = useSettingsStore()
    expect(settings.state.inflationPercent).toBe(5)
    expect(settings.state.projectionAnnualRatePercent).toBe(9)
    expect(settings.state.withdrawalRatePercent).toBe(4)
    expect(screen.getByTestId('assumptions-source').textContent).toMatch(
      /DANE y Banco de la República, consultado octubre de 2026/i
    )
  })

  it('TC-C-003 (AC-1.3): out-of-range input shows the range and keeps the stored value', async () => {
    render(AssumptionsPanel, { global: { plugins: plugins() } })
    const input = screen.getByTestId('assumption-inflation')
    await fireEvent.update(input, '31')
    expect(screen.getByTestId('assumption-inflation-error').textContent).toMatch(/entre 0 y 30/)
    expect(useSettingsStore().state.inflationPercent).toBe(5)
  })

  it('TC-C-004 (AC-1.4): real rate and optimistic warning', async () => {
    render(AssumptionsPanel, { global: { plugins: plugins() } })
    expect(screen.getByTestId('assumptions-real-rate').textContent).toMatch(/3,81\s?%/)
    expect(screen.queryByTestId('assumptions-optimistic')).toBeNull()
    await fireEvent.update(screen.getByTestId('assumption-return'), '13')
    expect(screen.getByTestId('assumptions-real-rate').textContent).toMatch(/7,62\s?%/)
    expect(screen.getByTestId('assumptions-optimistic')).toBeTruthy()
  })

  it('TC-C-005 (AC-1.5): the return field edits the shared projection rate', async () => {
    render(AssumptionsPanel, { global: { plugins: plugins() } })
    await fireEvent.update(screen.getByTestId('assumption-return'), '7')
    expect(useSettingsStore().state.projectionAnnualRatePercent).toBe(7)
  })
})

describe('FinancialFreedomView (US-2)', () => {
  it('TC-C-010 (AC-2.2, AC-2.1): hero years and capital in today pesos', () => {
    render(FinancialFreedomView, { global: { plugins: plugins(), stubs } })
    expect(screen.getByTestId('fi-horizon').textContent).toMatch(/35,8 años/)
    expect(screen.getByTestId('fi-target').textContent).toMatch(/\$1\.200\.000\.000/)
  })

  it('TC-C-011 (AC-2.3): required monthly for the desired horizon, editable', async () => {
    render(FinancialFreedomView, { global: { plugins: plugins(), stubs } })
    expect(screen.getByTestId('fi-required').textContent).toMatch(
      /Para lograrlo en 20 años ahorra \$4\.545\.244\/mes \(hoy \$2\.000\.000\)/
    )
    await fireEvent.update(screen.getByTestId('fi-desired-years'), '10')
    expect(screen.getByTestId('fi-required').textContent).toMatch(/\$9\.679\.098\/mes/)
    expect(useSettingsStore().state.fiDesiredYears).toBe(10)
  })

  it('TC-C-011 (AC-2.3 negative): sufficient savings shows the green message', () => {
    feasibleSavings.value = 5_000_000
    render(FinancialFreedomView, { global: { plugins: plugins(), stubs } })
    expect(screen.getByTestId('fi-required').textContent).toMatch(
      /Tu ahorro actual alcanza para lograrlo en 20 años/
    )
  })

  it('TC-C-012 (AC-2.4): benefit line, and invitation when the return is 0', () => {
    const { unmount } = render(FinancialFreedomView, { global: { plugins: plugins(), stubs } })
    expect(screen.getByTestId('fi-benefit').textContent).toMatch(
      /Sin invertir no lo alcanzarías; invirtiendo lo logras en 35,8 años/
    )
    unmount()
    render(FinancialFreedomView, {
      global: { plugins: plugins({ projectionAnnualRatePercent: 0, inflationPercent: 0 }), stubs },
    })
    expect(screen.queryByTestId('fi-benefit')).toBeNull()
    expect(screen.getByTestId('fi-invite-return').textContent).toMatch(
      /Agrega una rentabilidad esperada/
    )
  })

  it('TC-C-012 (AC-2.4): both reachable → "llegas N años antes"', () => {
    render(FinancialFreedomView, {
      global: { plugins: plugins({ inflationPercent: 0 }), stubs },
    })
    // 575 − 210 months = 30.4 years.
    expect(screen.getByTestId('fi-benefit').textContent).toMatch(
      /Con rentabilidad llegas 30,4 años antes/
    )
  })

  it('TC-C-013 (AC-2.5): context line and disclaimer', () => {
    render(FinancialFreedomView, { global: { plugins: plugins(), stubs } })
    expect(screen.getByTestId('fi-assumptions').textContent).toMatch(
      /Con rentabilidad 9\s?% E\.A\., inflación 5\s?% y retiro 4\s?%\. Montos en pesos de hoy\./
    )
    expect(screen.getByTestId('fi-disclaimer').textContent).toMatch(/Simulación educativa/)
  })

  it('TC-C-014 (AC-2.6): unreachable shows amber copy and keeps the required monthly', () => {
    render(FinancialFreedomView, {
      global: { plugins: plugins({ projectionAnnualRatePercent: 0 }), stubs },
    })
    expect(screen.getByTestId('fi-horizon').textContent).toMatch(
      /No alcanzable con tus supuestos actuales/
    )
    expect(screen.getByTestId('fi-required')).toBeTruthy()
  })
})

describe('GoalCard / GoalList (US-3)', () => {
  it('TC-C-020 (AC-3.1): new-goal form and card expose the invested switch, off by default', async () => {
    render(GoalList, { global: { plugins: plugins({}, [exampleGoal(false)]) } })
    const cardSwitch = screen.getByTestId('goal-invested-toggle') as HTMLInputElement
    expect(cardSwitch.checked).toBe(false)
    await fireEvent.click(screen.getByText('+ Nueva meta'))
    const formSwitch = screen.getByTestId('goal-form-invested') as HTMLInputElement
    expect(formSwitch.checked).toBe(false)
    await fireEvent.click(cardSwitch)
    expect(useGoalsStore().state.items[0]!.invested).toBe(true)
  })

  it('TC-C-021 (AC-3.2): target as hero and the inflation-adjusted equivalent', () => {
    render(GoalCard, { props: { goal: exampleGoal(true) }, global: { plugins: plugins() } })
    expect(screen.getByTestId('goal-target').textContent).toMatch(/\$100\.000\.000/)
    expect(screen.getByTestId('goal-equivalent').textContent).toMatch(
      /Equivale a \$127\.628\.156 en octubre de 2031/i
    )
  })

  it('TC-C-022 (AC-3.3, AC-3.4): estimated date and required monthly, invested vs not', () => {
    const { unmount } = render(GoalCard, {
      props: { goal: exampleGoal(true) },
      global: { plugins: plugins() },
    })
    expect(screen.getByTestId('goal-estimated').textContent).toMatch(/marzo de 2031/i) // +53 months
    expect(screen.getByTestId('goal-required').textContent).toMatch(/\$1\.296\.025\/mes/)
    unmount()
    render(GoalCard, { props: { goal: exampleGoal(false) }, global: { plugins: plugins() } })
    expect(screen.getByTestId('goal-estimated').textContent).toMatch(/mayo de 2033/i) // +79 months
    expect(screen.getByTestId('goal-required').textContent).toMatch(/\$1\.793\.803\/mes/)
  })

  it('TC-C-023 (AC-3.5): on-track and behind states', () => {
    const { unmount } = render(GoalCard, {
      props: { goal: exampleGoal(true) },
      global: { plugins: plugins() },
    })
    expect(screen.getByTestId('goal-status').textContent).toMatch(/En camino/)
    expect(text()).toMatch(/Llegas 7 meses antes/)
    unmount()
    render(GoalCard, { props: { goal: exampleGoal(false) }, global: { plugins: plugins() } })
    expect(screen.getByTestId('goal-status').textContent).toMatch(/Atrasada/)
    expect(text()).toMatch(/Para llegar a tiempo ahorra \$1\.793\.803\/mes \(hoy \$1\.500\.000\)/)
  })

  it('TC-C-024 (AC-3.6): investing benefit line only when invested with a return', () => {
    const { unmount } = render(GoalCard, {
      props: { goal: exampleGoal(true) },
      global: { plugins: plugins() },
    })
    expect(screen.getByTestId('goal-benefit').textContent).toMatch(
      /Invirtiendo llegas 26 meses antes y necesitas \$497\.778 menos al mes/
    )
    unmount()
    render(GoalCard, { props: { goal: exampleGoal(false) }, global: { plugins: plugins() } })
    expect(screen.queryByTestId('goal-benefit')).toBeNull()
  })
})
