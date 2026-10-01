// T-013 — Covers: AC-5.1, AC-5.2 · TC-I-010, TC-I-011
import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import MonthActivityCard from '@/components/dashboard/MonthActivityCard.vue'
import { i18n } from '@/i18n'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: { template: '<div />' } },
    { path: '/variable', name: 'variable', component: { template: '<div />' } },
  ],
})

type Cat = { name: string; spent: number }

function mountActivity(cats: Cat[]) {
  return render(MonthActivityCard, {
    global: {
      plugins: [
        i18n,
        router,
        createTestingPinia({
          createSpy: vi.fn,
          stubActions: false,
          initialState: {
            settings: {
              state: { lang: 'es', currency: 'COP', theme: 'system', payoffMethod: 'avalanche' },
            },
            variableExpenses: {
              state: {
                items: cats.map((c, i) => ({
                  id: `v${i}`,
                  name: c.name,
                  budget: 1_000_000,
                  spent: c.spent,
                  categoryId: 'other',
                })),
              },
            },
          },
        }),
      ],
    },
  })
}

describe('MonthActivityCard (TC-I-010, TC-I-011)', () => {
  it('TC-I-010 (AC-5.1): top 5 categories by spent desc, alphabetical tie-break', () => {
    mountActivity([
      { name: 'Mercado', spent: 500_000 },
      { name: 'Transporte', spent: 200_000 },
      { name: 'Salidas', spent: 300_000 },
      { name: 'Café', spent: 300_000 },
      { name: 'Ropa', spent: 100_000 },
      { name: 'Apps', spent: 50_000 },
      { name: 'Otros', spent: 25_000 },
    ])
    const rows = screen.getAllByTestId('activity-row')
    expect(rows).toHaveLength(5)
    const names = rows.map((r) => r.textContent ?? '')
    expect(names[0]).toContain('Mercado')
    // 300k tie: Café before Salidas (alphabetical)
    expect(names[1]).toContain('Café')
    expect(names[2]).toContain('Salidas')
    expect(names[3]).toContain('Transporte')
    expect(names[4]).toContain('Ropa')
    expect(screen.getByTestId('activity-view-all').getAttribute('href')).toBe('/variable')
  })

  it('TC-I-010 (AC-5.1 negative): zero-spent categories never displace spending ones', () => {
    mountActivity([
      { name: 'Aaa sin gasto', spent: 0 },
      { name: 'Mercado', spent: 100_000 },
    ])
    const rows = screen.getAllByTestId('activity-row')
    expect(rows[0]?.textContent).toContain('Mercado')
  })

  it('TC-I-011 (AC-5.2): empty state with neutral copy and a visible CTA', () => {
    mountActivity([{ name: 'Mercado', spent: 0 }])
    expect(screen.queryAllByTestId('activity-row')).toHaveLength(0)
    expect(screen.getByTestId('activity-empty').textContent).toContain(
      'Aún no registras gastos este mes'
    )
    expect(screen.getByTestId('activity-empty-cta')).toBeTruthy()
  })
})
