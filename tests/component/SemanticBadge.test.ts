import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import SemanticBadge from '@/components/common/SemanticBadge.vue'

describe('SemanticBadge (AC-17.6 TC-C-025)', () => {
  it('AC-17.6 TC-C-025: renders label text', () => {
    render(SemanticBadge, { props: { status: 'danger', label: 'Riesgo alto' } })
    expect(screen.getByText('Riesgo alto')).toBeTruthy()
  })

  it('AC-17.6 TC-C-025: renders an icon (not color-only) for status=warning', () => {
    render(SemanticBadge, { props: { status: 'warning', label: 'Atención' } })
    const icon = document.querySelector('svg.lucide')
    expect(icon).toBeTruthy()
  })

  it('AC-17.6 TC-C-025: applies color class for each status', () => {
    const cases: Array<['success' | 'warning' | 'danger' | 'info', RegExp]> = [
      ['success', /green|emerald/],
      ['warning', /amber|yellow/],
      ['danger', /red|rose/],
      ['info', /blue|sky/],
    ]
    for (const [status, regex] of cases) {
      const { unmount } = render(SemanticBadge, { props: { status, label: status } })
      const badge = screen.getByText(status).closest('[data-status]') as HTMLElement
      expect(badge.getAttribute('data-status')).toBe(status)
      expect(badge.className).toMatch(regex)
      unmount()
    }
  })
})
