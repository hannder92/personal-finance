import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { setLocale } from '@/i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import DayOverview from '@/components/dashboard/day/DayOverview.vue'
import { i18n } from '@/i18n'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/networth', component: { template: '<div />' } },
    { path: '/debts', component: { template: '<div />' } },
  ],
})

describe('DayOverview (20260530-mi-dia-cobertura)', () => {
  beforeEach(() => {
    setLocale('en')
  })

  afterEach(() => {
    setLocale('es')
  })

  it('TC-C-076 (AC-4.2): English locale without raw Spanish in visible text', () => {
    const { container } = render(DayOverview, {
      global: {
        plugins: [
          i18n,
          router,
          createTestingPinia({
            createSpy: vi.fn,
            stubActions: false,
            initialState: {
              settings: {
                state: { currency: 'COP', lang: 'en', theme: 'system', payoffMethod: 'avalanche' },
              },
              cards: { state: { items: [] } },
              assets: { state: { items: [] } },
              expenses: { state: { items: [] } },
              variableExpenses: { state: { items: [] } },
            },
          }),
        ],
      },
    })
    const text = container.textContent ?? ''
    expect(text).not.toMatch(/mañana|pasado mañana|cubres lo pendiente/i)
    expect(screen.getByTestId('data-day-overview')).toBeTruthy()
    expect(text).toMatch(/today|coverage|payments/i)
  })
})
