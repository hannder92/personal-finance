import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import RetentionEstimator from '@/components/income/RetentionEstimator.vue'
import { useSettingsStore } from '@/stores/settingsStore'

type Deduction = { id: string; label: string; amount: number; type: 'fixed' | 'percent' }

function mountEstimator(grossSalary: number, deductions: Deduction[] = []) {
  return render(RetentionEstimator, {
    props: { grossSalary, currency: 'COP' },
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          stubActions: false,
          initialState: {
            settings: { state: { currency: 'COP', lang: 'es', deductRetencion: true } },
            income: {
              state: { grossSalary, deductions, otherStreams: [], nonSalaryBenefits: [] },
            },
          },
        }),
      ],
    },
  })
}

describe('RetentionEstimator (AC-2.3 TC-C-008)', () => {
  it('AC-2.3 TC-C-008: gross above threshold shows an estimated retention amount', () => {
    mountEstimator(12_000_000)

    expect(screen.getByText(/estimada|estimated/i)).toBeTruthy()
    const $matches = screen.queryAllByText(/\$\s*[\d.]+/)
    expect($matches.length).toBeGreaterThan(0)
  })

  it('AC-2.3 TC-C-008: gross below threshold shows zero / no retention indicator', () => {
    mountEstimator(2_000_000)
    const text = document.body.textContent ?? ''
    expect(text.match(/\$\s*0|no\s+aplica|sin\s+retenci/i)).toBeTruthy()
    expect(screen.queryByTestId('retention-deduct-toggle')).toBeNull()
  })

  it('AC-2.3 TC-C-008: retention value matches calcRetencion for 12M gross', async () => {
    mountEstimator(12_000_000)
    const { calcRetencion } = await import('@/lib/tax/colombia/retencion')
    const expected = calcRetencion(12_000_000).amount
    expect(expected).toBeGreaterThan(0)
    const formatted = new Intl.NumberFormat('es-CO').format(expected)
    expect(document.body.textContent).toContain(formatted)
  })

  it('toggle turns off subtracting the retention from net income', async () => {
    mountEstimator(12_000_000)
    const settings = useSettingsStore()
    const toggle = screen.getByTestId('retention-deduct-toggle') as HTMLInputElement
    expect(toggle.checked).toBe(true)
    await fireEvent.click(toggle)
    expect(settings.state.deductRetencion).toBe(false)
  })

  it('shows a note instead of the toggle when a manual retention deduction exists', () => {
    mountEstimator(12_000_000, [
      { id: 'r', label: 'Retención en la fuente', amount: 500_000, type: 'fixed' },
    ])
    expect(screen.queryByTestId('retention-deduct-toggle')).toBeNull()
    expect(screen.getByTestId('retention-manual-note')).toBeTruthy()
  })
})
