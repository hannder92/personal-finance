import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PrepaymentSimulator from '@/components/debts/PrepaymentSimulator.vue'
import DebtsView from '@/views/DebtsView.vue'
import { i18n } from '@/i18n'
import { useSettingsStore } from '@/stores/settingsStore'

const settingsState = {
  lang: 'es',
  currency: 'COP',
  theme: 'system',
  payoffMethod: 'avalanche',
  lastMonthSeen: null,
  onboarding: { done: true, currentStep: 0 },
  deductRetencion: false,
}

const loan = {
  id: '11111111-1111-4111-8111-111111111111',
  type: 'loan' as const,
  name: 'Crédito libre inversión',
  balance: 40_000_000,
  apr: 22,
  minPayment: 1_100_000,
  remainingInstallments: 60,
  payrollDeducted: false,
}

const card = {
  id: '22222222-2222-4222-8222-222222222222',
  type: 'card' as const,
  name: 'Visa',
  balance: 3_000_000,
  limit: 5_000_000,
  apr: 29,
  minPayment: 150_000,
  dueDate: null,
  installments: [],
}

function mount(
  component: typeof PrepaymentSimulator | typeof DebtsView,
  items: unknown[],
  income: Record<string, unknown> = {}
) {
  return render(component, {
    global: {
      plugins: [
        i18n,
        createTestingPinia({
          createSpy: vi.fn,
          stubActions: false,
          initialState: {
            settings: { state: settingsState },
            cards: { state: { items } },
            income: {
              state: {
                grossSalary: 10_000_000,
                deductions: [],
                otherStreams: [],
                nonSalaryBenefits: [],
                ...income,
              },
            },
          },
        }),
      ],
    },
  })
}

async function type(testId: string, value: string) {
  const input = screen.getByTestId(testId)
  await fireEvent.focus(input)
  await fireEvent.update(input, value)
  await fireEvent.blur(input)
}

describe('PrepaymentSimulator', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 2))
  })
  afterEach(() => vi.useRealTimers())

  it('without abonos only the cuota rollover is compared and the order is listed', () => {
    mount(PrepaymentSimulator, [loan, card])
    expect(screen.getByTestId('prepayment-plan-date')).toBeTruthy()
    const rows = screen.getAllByTestId('prepayment-debt-row')
    expect(rows[0]!.textContent).toContain('Visa')
    expect(rows[1]!.textContent).toContain('Crédito libre inversión')
  })

  it('a monthly extra shows months and interest saved as benefit copy', async () => {
    mount(PrepaymentSimulator, [loan])
    expect(screen.queryByTestId('prepayment-months-saved')).toBeNull()
    await type('prepayment-extra', '500000')
    expect(screen.getByTestId('prepayment-months-saved').textContent).toMatch(
      /Terminas \d+ meses antes/
    )
    expect(screen.getByTestId('prepayment-interest-saved').textContent).toMatch(
      /menos en intereses/
    )
  })

  it('"reducir cuota" keeps the date and shows the lower cuota', async () => {
    mount(PrepaymentSimulator, [loan])
    await fireEvent.click(screen.getByTestId('prepayment-mode-payment'))
    await type('prepayment-extra', '300000')
    expect(screen.queryByTestId('prepayment-months-saved')).toBeNull()
    expect(screen.getByTestId('prepayment-interest-saved')).toBeTruthy()
    expect(screen.getByTestId('prepayment-cuota-change').textContent).toMatch(/baja de/)
  })

  it('fills prima and cesantías interest estimates from the salary', async () => {
    mount(PrepaymentSimulator, [loan])
    await fireEvent.click(screen.getByTestId('prepayment-use-estimates'))
    expect((screen.getByTestId('prepayment-prima') as HTMLInputElement).value).toMatch(
      /5\.000\.000/
    )
    expect((screen.getByTestId('prepayment-cesantias') as HTMLInputElement).value).toMatch(
      /1\.200\.000/
    )
    expect(screen.getByTestId('prepayment-months-saved')).toBeTruthy()
  })

  it('switching the order updates the payoff method setting', async () => {
    mount(PrepaymentSimulator, [loan, card])
    await fireEvent.click(screen.getByTestId('prepayment-order-snowball'))
    expect(useSettingsStore().state.payoffMethod).toBe('snowball')
  })

  it('warns when a debt never ends', () => {
    mount(PrepaymentSimulator, [{ ...card, minPayment: 10_000 }])
    expect(screen.getByTestId('prepayment-never')).toBeTruthy()
  })
})

describe('DebtsView — libranza', () => {
  it('shows the double-count hint until the loan is marked as libranza', async () => {
    mount(DebtsView, [loan], {
      deductions: [
        {
          id: '33333333-3333-4333-8333-333333333333',
          label: 'Libranza',
          amount: 1_100_000,
          type: 'fixed',
        },
      ],
    })
    expect(screen.getByTestId('libranza-double-count-hint')).toBeTruthy()
    await fireEvent.click(screen.getByTestId('debt-payroll-toggle'))
    expect(screen.queryByTestId('libranza-double-count-hint')).toBeNull()
    expect(screen.getByTestId('debt-libranza-badge')).toBeTruthy()
  })
})
