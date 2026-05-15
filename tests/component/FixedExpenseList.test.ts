import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import FixedExpenseList from '@/components/expenses/FixedExpenseList.vue'
import { useExpensesStore } from '@/stores/expensesStore'

function mount(
  initialItems: Array<{ id: string; name: string; amount: number; category: string }> = []
) {
  return render(FixedExpenseList, {
    global: {
      plugins: [
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
                grossSalary: 5_000_000,
                deductions: [],
                otherStreams: [],
                nonSalaryBenefits: [],
              },
            },
            expenses: { state: { items: initialItems } },
          },
        }),
      ],
    },
  })
}

describe('FixedExpenseList (AC-4.1 AC-4.2 TC-C-012)', () => {
  it('AC-4.1 TC-C-012: submitting the form adds an expense to the list', async () => {
    mount()
    const store = useExpensesStore()

    const nameInput = screen.getByRole('textbox', { name: /nombre|name/i }) as HTMLInputElement
    const amountInput = screen.getByRole('textbox', { name: /monto|amount/i }) as HTMLInputElement
    const categoryInput = screen.getByRole('combobox', { name: /categor/i }) as HTMLSelectElement

    await fireEvent.update(nameInput, 'Arriendo')
    await fireEvent.update(amountInput, '1500000')
    await fireEvent.update(categoryInput, 'vivienda')

    await fireEvent.click(screen.getByRole('button', { name: /agregar|add/i }))

    expect(store.state.items.length).toBe(1)
    expect(screen.getByText('Arriendo')).toBeTruthy()
  })

  it('AC-4.2 TC-C-012: total expenses label sums all amounts', () => {
    mount([
      { id: 'e1', name: 'Arriendo', amount: 1_500_000, category: 'vivienda' },
      { id: 'e2', name: 'Servicios', amount: 300_000, category: 'utilities' },
    ])
    // Total = 1.800.000
    expect(screen.getByText(/\$\s*1\.800\.000/)).toBeTruthy()
  })
})

describe('FixedExpenseList (AC-4.4 TC-C-013)', () => {
  it('AC-4.4 TC-C-013: clicking delete opens ConfirmDialog; confirm removes the item', async () => {
    mount([{ id: 'e1', name: 'Arriendo', amount: 1_500_000, category: 'vivienda' }])
    const store = useExpensesStore()

    const deleteBtn = screen.getByRole('button', { name: /eliminar|delete/i })
    await fireEvent.click(deleteBtn)

    // ConfirmDialog should appear with role=dialog
    expect(screen.getByRole('dialog')).toBeTruthy()

    const confirmBtn = screen.getByRole('button', { name: /confirmar|confirm|sí|si/i })
    await fireEvent.click(confirmBtn)

    expect(store.state.items.length).toBe(0)
    expect(screen.queryByText('Arriendo')).toBeNull()
  })

  it('AC-4.4 TC-C-013: cancel keeps the item in the list', async () => {
    mount([{ id: 'e1', name: 'Arriendo', amount: 1_500_000, category: 'vivienda' }])
    const store = useExpensesStore()

    await fireEvent.click(screen.getByRole('button', { name: /eliminar|delete/i }))

    expect(screen.getByRole('dialog')).toBeTruthy()
    const cancelBtn = screen.getByRole('button', { name: /cancelar|cancel|no/i })
    await fireEvent.click(cancelBtn)

    expect(store.state.items.length).toBe(1)
    expect(screen.getByText('Arriendo')).toBeTruthy()
  })
})
