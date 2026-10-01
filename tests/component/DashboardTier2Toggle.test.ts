import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import DashboardTier2Toggle from '@/components/dashboard/DashboardTier2Toggle.vue'
import { i18n } from '@/i18n'

describe('DashboardTier2Toggle (20260604-dashboard-progressive-disclosure)', () => {
  it('TC-C-082 (AC-1.3): hint visible when collapsed', () => {
    render(DashboardTier2Toggle, {
      props: { expanded: false },
      global: { plugins: [i18n] },
    })
    expect(screen.getByText('KPIs, gráficos y proyección')).toBeTruthy()
  })

  it('TC-C-083 (AC-2.1): expand copy in Spanish', () => {
    render(DashboardTier2Toggle, {
      props: { expanded: false },
      global: { plugins: [i18n] },
    })
    const btn = screen.getByTestId('dashboard-tier2-toggle')
    expect(btn.textContent).toBe('Ver análisis del mes')
    expect(btn.getAttribute('aria-expanded')).toBe('false')
  })

  it('TC-C-084 (AC-2.1): expand copy in English', () => {
    i18n.global.locale.value = 'en'
    render(DashboardTier2Toggle, {
      props: { expanded: false },
      global: { plugins: [i18n] },
    })
    expect(screen.getByTestId('dashboard-tier2-toggle').textContent).toBe('View monthly analysis')
    i18n.global.locale.value = 'es'
  })

  it('TC-C-086 (AC-2.3): collapse copy when expanded', () => {
    render(DashboardTier2Toggle, {
      props: { expanded: true },
      global: { plugins: [i18n] },
    })
    expect(screen.getByTestId('dashboard-tier2-toggle').textContent).toBe('Ocultar análisis')
    expect(screen.queryByText('KPIs, gráficos y proyección')).toBeNull()
  })

  it('TC-C-087 (AC-2.4): touch target at least 44px height', () => {
    render(DashboardTier2Toggle, {
      props: { expanded: false },
      global: { plugins: [i18n] },
    })
    expect(screen.getByTestId('dashboard-tier2-toggle').className).toContain('min-h-11')
  })

  it('TC-C-091 (constitution): emits toggle on click', async () => {
    const { emitted } = render(DashboardTier2Toggle, {
      props: { expanded: false },
      global: { plugins: [i18n] },
    })
    await fireEvent.click(screen.getByTestId('dashboard-tier2-toggle'))
    expect(emitted().toggle).toHaveLength(1)
  })
})
