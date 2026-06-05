import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import DayAgendaCard from '@/components/dashboard/day/DayAgendaCard.vue'
import type { AgendaDayRow } from '@/lib/calculations/day-obligations'
import { i18n } from '@/i18n'

const agenda: AgendaDayRow[] = [
  { offset: 0, paymentCount: 0, totalMinPayment: 0 },
  { offset: 1, paymentCount: 1, totalMinPayment: 100_000 },
  { offset: 2, paymentCount: 0, totalMinPayment: 0 },
]

describe('DayAgendaCard (20260530-mi-dia-cobertura)', () => {
  it('TC-C-074 (AC-3.1, AC-3.2): three agenda rows with none on empty day', () => {
    render(DayAgendaCard, {
      props: { agenda },
      global: {
        plugins: [
          i18n,
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
    expect(screen.getAllByTestId('data-agenda-row')).toHaveLength(3)
    const rows = screen.getAllByTestId('data-agenda-row')
    expect(rows[0]?.querySelector('[data-agenda-count="0"]')?.textContent).toMatch(
      /sin vencimientos/i
    )
  })
})
