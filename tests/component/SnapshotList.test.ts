import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import SnapshotList from '@/components/history/SnapshotList.vue'

const baseSnapshot = {
  id: '',
  capturedAt: '2026-04-01T00:00:00.000Z',
  netIncome: 4_000_000,
  fixedExpenses: 1_000_000,
  debtPayments: 500_000,
  dti: 12,
  netWorth: 5_000_000,
  healthScore: 70,
}

describe('SnapshotList (AC-13.4 TC-C-029)', () => {
  it('AC-13.4 TC-C-029: lists snapshots newest first', () => {
    const snapshots = [
      { ...baseSnapshot, id: 's1', month: '2026-01' },
      { ...baseSnapshot, id: 's2', month: '2026-03' },
      { ...baseSnapshot, id: 's3', month: '2026-02' },
    ]
    render(SnapshotList, { props: { snapshots, currency: 'COP' } })

    const items = document.querySelectorAll('[data-month]')
    expect(items.length).toBe(3)
    expect(items[0]!.getAttribute('data-month')).toBe('2026-03')
    expect(items[1]!.getAttribute('data-month')).toBe('2026-02')
    expect(items[2]!.getAttribute('data-month')).toBe('2026-01')
  })

  it('AC-13.4 TC-C-029: empty state when no snapshots', () => {
    render(SnapshotList, { props: { snapshots: [], currency: 'COP' } })
    expect(document.querySelectorAll('[data-month]').length).toBe(0)
    const text = document.body.textContent ?? ''
    expect(/sin\s+snapshots|sin\s+historial|empty|vac/i.test(text)).toBe(true)
  })

  it('AC-13.4 TC-C-029: each item shows score and net income', () => {
    const snapshots = [
      { ...baseSnapshot, id: 's1', month: '2026-04', healthScore: 75, netIncome: 4_500_000 },
    ]
    render(SnapshotList, { props: { snapshots, currency: 'COP' } })
    expect(screen.getByText(/75/)).toBeTruthy()
    expect(screen.getByText(/\$\s*4\.500\.000/)).toBeTruthy()
  })
})
