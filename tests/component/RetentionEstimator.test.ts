import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import RetentionEstimator from '@/components/income/RetentionEstimator.vue'

describe('RetentionEstimator (AC-2.3 TC-C-008)', () => {
  it('AC-2.3 TC-C-008: gross above threshold shows a retention amount with "estimado"', () => {
    render(RetentionEstimator, { props: { grossSalary: 12_000_000, currency: 'COP' } })

    expect(screen.getByText(/estimado/i)).toBeTruthy()
    // Some currency value visible somewhere in the component.
    const $matches = screen.queryAllByText(/\$\s*[\d.]+/)
    expect($matches.length).toBeGreaterThan(0)
  })

  it('AC-2.3 TC-C-008: gross below threshold shows zero / no retention indicator', () => {
    render(RetentionEstimator, { props: { grossSalary: 2_000_000, currency: 'COP' } })
    // Either renders a "$0" or a "no aplica" message.
    const text = document.body.textContent ?? ''
    expect(text.match(/\$\s*0|no\s+aplica|sin\s+retenci/i)).toBeTruthy()
  })

  it('AC-2.3 TC-C-008: retention value matches calcRetencion for 12M gross', async () => {
    render(RetentionEstimator, { props: { grossSalary: 12_000_000, currency: 'COP' } })
    // Cross-check against the canonical lib calculation.
    const { calcRetencion } = await import('@/lib/tax/colombia/retencion')
    const expected = calcRetencion(12_000_000).amount

    if (expected > 0) {
      // Format expected with es-CO grouping for matching (no decimals for COP).
      const formatted = new Intl.NumberFormat('es-CO').format(expected)
      // Strip thousands separators for robust substring match.
      const stripped = String(expected)
      const bodyText = document.body.textContent ?? ''
      expect(bodyText.includes(formatted) || bodyText.includes(stripped)).toBe(true)
    }
  })
})
