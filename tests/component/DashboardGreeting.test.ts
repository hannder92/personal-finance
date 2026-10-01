// T-009 — Covers: AC-1.1, AC-1.2, EC-2 · TC-I-001
import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { afterEach, describe, expect, it, vi } from 'vitest'
import DashboardGreeting from '@/components/dashboard/DashboardGreeting.vue'
import { i18n } from '@/i18n'

function mountGreeting(userName = '', at = new Date(2026, 5, 9, 8, 0, 0)) {
  vi.useFakeTimers()
  vi.setSystemTime(at)
  return render(DashboardGreeting, {
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
                projectionAnnualRatePercent: 0,
                userName,
              },
            },
          },
        }),
      ],
    },
  })
}

afterEach(() => {
  vi.useRealTimers()
})

describe('DashboardGreeting (TC-I-001)', () => {
  it('AC-1.1: shows morning greeting and today date at 8:00 without name', () => {
    mountGreeting('', new Date(2026, 5, 9, 8, 0, 0))
    expect(screen.getByTestId('dashboard-greeting').textContent).toContain('Buenos días')
    const date = screen.getByTestId('dashboard-greeting-date').textContent ?? ''
    expect(date.toLowerCase()).toMatch(/9/)
    expect(date.toLowerCase()).toMatch(/junio|jun/)
  })

  it('AC-1.1 negative: old flat title is not the main heading', () => {
    mountGreeting()
    expect(screen.getByTestId('dashboard-greeting').textContent).not.toMatch(/^Resumen$/)
  })

  it('AC-1.2: includes configured name in evening greeting at 20:00', () => {
    mountGreeting('Johann', new Date(2026, 5, 9, 20, 0, 0))
    const text = screen.getByTestId('dashboard-greeting').textContent ?? ''
    expect(text).toContain('Buenas noches, Johann')
    expect(text).not.toContain('JohannJohann')
  })

  it('XSS: a script-looking name renders as plain text', () => {
    mountGreeting('<b>x</b>', new Date(2026, 5, 9, 8, 0, 0))
    expect(screen.getByTestId('dashboard-greeting').textContent).toContain('<b>x</b>')
    expect(document.querySelector('[data-testid="dashboard-greeting"] b')).toBeNull()
  })
})
