import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import HealthScore from '@/components/dashboard/HealthScore.vue'
import { i18n } from '@/i18n'

const globalPlugins = { plugins: [i18n] }

describe('HealthScore (AC-11.2 TC-C-027)', () => {
  it('AC-11.2 TC-C-027: clicking opens a breakdown panel with 4 components', async () => {
    render(HealthScore, {
      props: {
        score: 75,
        label: 'Saludable',
        breakdown: { dti: 25, emergency: 80, housing: 28, savings: 18 },
      },
      global: globalPlugins,
    })

    expect(screen.queryByText(/dti/i)).toBeNull()

    const btn = screen.getByRole('button', { name: /75/ })
    await fireEvent.click(btn)

    expect(screen.getByText(/dti/i)).toBeTruthy()
    expect(document.querySelector('[data-component="emergency"]')).toBeTruthy()
    expect(screen.getByText(/vivienda|housing/i)).toBeTruthy()
    expect(document.querySelector('[data-component="savings"]')).toBeTruthy()
  })

  it('AC-11.2 TC-C-027: each breakdown row exposes a semaphore status', async () => {
    render(HealthScore, {
      props: {
        score: 60,
        label: 'Regular',
        breakdown: { dti: 25, emergency: 80, housing: 28, savings: 18 },
      },
      global: globalPlugins,
    })
    await fireEvent.click(screen.getByRole('button', { name: /60/ }))

    const rows = document.querySelectorAll('[data-component-status]')
    expect(rows.length).toBe(4)
    rows.forEach((r) => {
      expect(['ok', 'warn', 'danger']).toContain(r.getAttribute('data-component-status'))
    })
  })

  it('AC-11.1: renders score and label always', () => {
    render(HealthScore, {
      props: {
        score: 82,
        label: 'Excelente',
        breakdown: { dti: 10, emergency: 100, housing: 20, savings: 25 },
      },
      global: globalPlugins,
    })
    expect(screen.getByText('82')).toBeTruthy()
    expect(screen.getByText(/excelente/i)).toBeTruthy()
  })
})

describe('HealthScore (20260529-metricas-runway-ingresos)', () => {
  it('TC-C-062 (AC-2.3): emergency breakdown label differs from runway title', async () => {
    const runwayTitle = i18n.global.t('runway.title')
    const emergencyLabel = i18n.global.t('dashboard.health.breakdown.emergency')

    expect(emergencyLabel).not.toBe(runwayTitle)

    render(HealthScore, {
      props: {
        score: 75,
        label: 'Saludable',
        breakdown: { dti: 25, emergency: 80, housing: 28, savings: 18 },
      },
      global: globalPlugins,
    })

    await fireEvent.click(screen.getByRole('button', { name: /75/ }))
    expect(screen.getByText(emergencyLabel)).toBeTruthy()
  })

  it('TC-C-062 (AC-2.3): emergency hint explains distinction from runway', async () => {
    render(HealthScore, {
      props: {
        score: 75,
        label: 'Saludable',
        breakdown: { dti: 25, emergency: 80, housing: 28, savings: 18 },
      },
      global: globalPlugins,
    })

    await fireEvent.click(screen.getByRole('button', { name: /75/ }))
    expect(screen.getByText(/reserva de emergencia|emergency reserve/i)).toBeTruthy()
  })
})
