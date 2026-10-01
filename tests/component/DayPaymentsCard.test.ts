import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import DayPaymentsCard from '@/components/dashboard/day/DayPaymentsCard.vue'
import { i18n } from '@/i18n'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/debts', name: 'debts', component: { template: '<div data-testid="debts-page" />' } },
  ],
})

describe('DayPaymentsCard (20260530-mi-dia-cobertura)', () => {
  it('TC-C-072 (AC-2.1, AC-2.3): two payment items and section styling', () => {
    const { container } = render(DayPaymentsCard, {
      props: {
        payments: [
          { id: '1', name: 'Visa', minPayment: 200_000, dueDate: '2026-06-04' },
          { id: '2', name: 'Master', minPayment: 150_000, dueDate: '2026-06-04' },
        ],
      },
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
    expect(screen.getAllByTestId('data-payment-item')).toHaveLength(2)
    expect(container.querySelector('section')?.className).toMatch(/rounded-xl/)
    expect(screen.getAllByTestId('day-section-icon').length).toBeGreaterThan(0)
  })

  it('TC-C-073 (AC-2.2): link targets /debts', () => {
    render(DayPaymentsCard, {
      props: {
        payments: [{ id: '1', name: 'Visa', minPayment: 100_000, dueDate: '2026-06-04' }],
      },
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
    const link = screen.getByTestId('data-link-debts') as HTMLAnchorElement
    expect(link.getAttribute('href')).toMatch(/\/debts/)
  })

  it('TC-C-077 (security): XSS name escaped, no v-html in SFC', () => {
    const src = readFileSync(
      resolve(process.cwd(), 'src/components/dashboard/day/DayPaymentsCard.vue'),
      'utf8'
    )
    expect(src).not.toMatch(/v-html/)
    const { container } = render(DayPaymentsCard, {
      props: {
        payments: [
          {
            id: 'x',
            name: '<img onerror=alert(1)>',
            minPayment: 1,
            dueDate: '2026-06-04',
          },
        ],
      },
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
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByTestId('data-payment-item').textContent).toContain('<img')
  })
})
