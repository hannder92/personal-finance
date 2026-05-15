import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import KpiCard from '@/components/dashboard/KpiCard.vue'

describe('KpiCard (AC-10.3 AC-17.6 TC-C-025)', () => {
  it('AC-10.3 TC-C-025: DTI > threshold renders alert color status', () => {
    render(KpiCard, {
      props: { label: 'DTI', value: 45, type: 'dti', threshold: 36 },
    })
    const root = document.querySelector('[data-risk]') as HTMLElement
    expect(['warn', 'danger']).toContain(root.getAttribute('data-risk'))
  })

  it('AC-17.6 TC-C-025: DTI at risk also exposes a non-color indicator (icon or label)', () => {
    render(KpiCard, {
      props: { label: 'DTI', value: 45, type: 'dti', threshold: 36 },
    })
    // Either a data-icon child or contextual text.
    const hasIcon = !!document.querySelector('[data-icon]')
    const text = document.body.textContent ?? ''
    const hasContext = /riesgo|risk|alto|deuda/i.test(text)
    expect(hasIcon || hasContext).toBe(true)
  })

  it('AC-10.3 TC-C-025: DTI within safe range renders ok status', () => {
    render(KpiCard, {
      props: { label: 'DTI', value: 20, type: 'dti', threshold: 36 },
    })
    const root = document.querySelector('[data-risk]') as HTMLElement
    expect(root.getAttribute('data-risk')).toBe('ok')
  })

  it('AC-10.1 TC-C-024: renders label and formatted value', () => {
    render(KpiCard, {
      props: { label: 'Ingreso bruto', value: 5_000_000, type: 'income', currency: 'COP' },
    })
    expect(screen.getByText('Ingreso bruto')).toBeTruthy()
    expect(screen.getByText(/\$\s*5\.000\.000/)).toBeTruthy()
  })
})
