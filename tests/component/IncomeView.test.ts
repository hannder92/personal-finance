import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import IncomeView from '@/views/IncomeView.vue'
import { i18n } from '@/i18n'

function mount(initial: Record<string, unknown> = {}) {
  return render(IncomeView, {
    global: {
      plugins: [
        i18n,
        createTestingPinia({
          createSpy: vi.fn,
          stubActions: false,
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
                grossSalary: 3_000_000,
                deductions: [{ id: 'd1', label: 'Salud', amount: 4, type: 'percent' }],
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

describe('IncomeView (AC-2.5 TC-C-009)', () => {
  it('AC-2.5 TC-C-009: changing grossSalary input recomputes deduction equivalent label', async () => {
    mount()

    // Initial: 4% of 3M = 120.000
    expect(screen.getByText(/\$\s*120\.000/)).toBeTruthy()

    const grossInput = screen.getByRole('textbox', {
      name: /salario|gross|bruto/i,
    }) as HTMLInputElement
    await fireEvent.update(grossInput, '6000000')

    // After change: 4% of 6M = 240.000
    expect(screen.getByText(/\$\s*240\.000/)).toBeTruthy()
  })
})

describe('IncomeView (20260529-metricas-runway-ingresos)', () => {
  it('TC-C-063 (AC-3.1, AC-3.3): salary shows linear class and mix totals by class', () => {
    mount({
      income: {
        state: {
          grossSalary: 8_000_000,
          deductions: [],
          otherStreams: [
            {
              id: 's1',
              label: 'Renta',
              amount: 1_000_000,
              frequency: 'monthly',
              incomeClass: 'passive',
            },
            {
              id: 's2',
              label: 'Consultoría',
              amount: 3_000_000,
              frequency: 'semiannual',
              incomeClass: 'residual',
            },
          ],
          nonSalaryBenefits: [],
        },
      },
      expenses: { state: { items: [] } },
      variableExpenses: { state: { items: [] } },
    })

    expect(screen.getByTestId('income-mix-linear')).toBeTruthy()
    expect(screen.getByTestId('income-mix-passive')).toBeTruthy()
    expect(screen.getByTestId('income-mix-residual')).toBeTruthy()
    expect(screen.getByTestId('income-mix-linear').textContent).toMatch(/8\.?000\.?000|8,000,000/)
    expect(screen.getByTestId('income-mix-passive').textContent).toMatch(/1\.?000\.?000|1,000,000/)
    expect(screen.getByTestId('income-mix-residual').textContent).toMatch(/500\.?000|500,000/)
    expect(screen.getByText(/salario bruto/i).closest('label')?.textContent).toMatch(
      /lineal|linear/i
    )
  })

  it('TC-C-063 (AC-3.2): stream form includes income class select with three options', async () => {
    mount()

    const addButtons = screen.getAllByRole('button', { name: /\+ agregar/i })
    await fireEvent.click(addButtons[1]!)

    const select = screen.getByTestId('income-class-select')
    expect(select).toBeTruthy()
    expect(select.querySelectorAll('option')).toHaveLength(3)
  })
})
