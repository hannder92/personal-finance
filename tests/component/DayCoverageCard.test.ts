import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import DayCoverageCard from '@/components/dashboard/day/DayCoverageCard.vue'
import type { DayCoverageView } from '@/composables/useDayOverview'
import { i18n } from '@/i18n'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/networth', component: { template: '<div />' } },
  ],
})

function mountCoverage(coverage: DayCoverageView) {
  return render(DayCoverageCard, {
    props: { coverage },
    global: {
      plugins: [
        i18n,
        router,
        createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            settings: {
              state: { currency: 'COP', lang: 'es', theme: 'system', payoffMethod: 'avalanche' },
            },
          },
        }),
      ],
    },
  })
}

describe('DayCoverageCard (20260530-mi-dia-cobertura)', () => {
  it('TC-C-068 (AC-1.1): covered badge and i18n ok', () => {
    mountCoverage({
      status: 'covered',
      shortfallAmount: 0,
      dueTodayTotal: 500_000,
      liquidTotal: 800_000,
    })
    const badge = document.querySelector('[data-coverage-status="covered"]')
    expect(badge).toBeTruthy()
    expect(screen.getByTestId('coverage-badge').textContent).toMatch(/cubres lo pendiente/i)
    const liquid = screen.getByTestId('liquid-secondary')
    expect(badge!.compareDocumentPosition(liquid)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('TC-C-069 (AC-1.2): shortfall shows gap amount', () => {
    mountCoverage({
      status: 'shortfall',
      shortfallAmount: 200_000,
      dueTodayTotal: 600_000,
      liquidTotal: 400_000,
    })
    const badge = document.querySelector('[data-coverage-status="shortfall"]')
    expect(badge?.textContent).toMatch(/200/)
  })

  it('TC-C-070 (AC-1.3): no due today relieved copy', () => {
    mountCoverage({
      status: 'no_due_today',
      shortfallAmount: 0,
      dueTodayTotal: 0,
      liquidTotal: 1_000_000,
    })
    expect(document.querySelector('[data-coverage-status="covered"]')).toBeNull()
    expect(screen.getByTestId('coverage-badge').textContent).toMatch(/sin pagos para hoy/i)
    expect(screen.queryByTestId('liquid-secondary')).toBeNull()
  })

  it('TC-C-070 (AC-1.5): no liquid shows patrimonio CTA', () => {
    mountCoverage({
      status: 'no_liquid',
      shortfallAmount: 100_000,
      dueTodayTotal: 100_000,
      liquidTotal: 0,
    })
    expect(document.querySelector('[data-coverage-status="covered"]')).toBeNull()
    const cta = document.querySelector('[data-cta-patrimonio]') as HTMLAnchorElement
    expect(cta?.getAttribute('href')).toMatch(/\/networth/)
  })

  it('TC-C-071 (AC-1.4): liquid secondary and context line', () => {
    mountCoverage({
      status: 'covered',
      shortfallAmount: 0,
      dueTodayTotal: 1,
      liquidTotal: 1_000_000,
    })
    expect(screen.getByTestId('liquid-secondary').textContent).toMatch(/1\.000\.000|1,000,000/)
    expect(screen.getByText(/incluye efectivo/i)).toBeTruthy()
  })
})
