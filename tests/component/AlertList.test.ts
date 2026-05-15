import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import AlertList from '@/components/common/AlertList.vue'

describe('AlertList (AC-17.6)', () => {
  it('AC-17.6: renders nothing visible when alerts is empty', () => {
    render(AlertList, { props: { alerts: [] } })
    const items = document.querySelectorAll('[data-alert-item]')
    expect(items.length).toBe(0)
  })

  it('AC-17.6: renders an item per alert with message and severity', () => {
    const alerts = [
      { id: 'a1', message: 'Tarjeta vence en 3 días', severity: 'warning' as const },
      { id: 'a2', message: 'DTI por encima de 45%', severity: 'danger' as const },
    ]
    render(AlertList, { props: { alerts } })

    expect(screen.getByText('Tarjeta vence en 3 días')).toBeTruthy()
    expect(screen.getByText('DTI por encima de 45%')).toBeTruthy()

    const items = document.querySelectorAll('[data-alert-item]')
    expect(items.length).toBe(2)
    expect(items[0]!.getAttribute('data-severity')).toBe('warning')
    expect(items[1]!.getAttribute('data-severity')).toBe('danger')
  })

  it('AC-17.6: each alert exposes role="listitem" inside a role="list"', () => {
    render(AlertList, {
      props: { alerts: [{ id: 'x', message: 'm', severity: 'info' as const }] },
    })
    expect(screen.getByRole('list')).toBeTruthy()
    expect(screen.getAllByRole('listitem').length).toBe(1)
  })
})
