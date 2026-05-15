import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import EmptyState from '@/components/common/EmptyState.vue'

describe('EmptyState (AC-17.8 TC-C-034)', () => {
  it('AC-17.8 TC-C-034: renders message and CTA when given props', () => {
    render(EmptyState, {
      props: {
        icon: 'inbox',
        message: 'No hay datos',
        ctaLabel: '+ Agregar primer gasto',
        ctaTo: '/expenses/new',
      },
    })

    expect(screen.getByText('No hay datos')).toBeTruthy()
    const cta = screen.getByRole('link', { name: /agregar primer gasto/i })
    expect(cta).toBeTruthy()
    expect(cta.getAttribute('href')).toContain('/expenses/new')
  })

  it('AC-17.8 TC-C-034: renders icon when icon prop provided', () => {
    render(EmptyState, {
      props: { icon: 'inbox', message: 'Vacío' },
    })

    const iconEl = document.querySelector('[data-icon]')
    expect(iconEl).toBeTruthy()
  })
})
