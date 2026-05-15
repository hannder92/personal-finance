import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import VariableCategoryCard from '@/components/variable/VariableCategoryCard.vue'

function statusOf() {
  const bar = document.querySelector('[role="progressbar"]') as HTMLElement
  return bar.getAttribute('data-status')
}

describe('VariableCategoryCard (AC-8.1 EC-4 TC-C-020)', () => {
  it('AC-8.1 TC-C-020: spent=0 → status="ok"', () => {
    render(VariableCategoryCard, {
      props: { name: 'Restaurantes', budget: 500_000, spent: 0, currency: 'COP' },
    })
    expect(statusOf()).toBe('ok')
  })

  it('AC-8.1 TC-C-020: spent=400_000 (80%) → status="warn"', () => {
    render(VariableCategoryCard, {
      props: { name: 'Restaurantes', budget: 500_000, spent: 400_000, currency: 'COP' },
    })
    expect(statusOf()).toBe('warn')
  })

  it('AC-8.1 TC-C-020: spent=600_000 (>100%) → status="over"', () => {
    render(VariableCategoryCard, {
      props: { name: 'Restaurantes', budget: 500_000, spent: 600_000, currency: 'COP' },
    })
    expect(statusOf()).toBe('over')
  })

  it('AC-8.1 TC-C-020: progress bar aria-valuenow caps at 100', () => {
    render(VariableCategoryCard, {
      props: { name: 'Restaurantes', budget: 500_000, spent: 750_000, currency: 'COP' },
    })
    const bar = document.querySelector('[role="progressbar"]') as HTMLElement
    expect(Number(bar.getAttribute('aria-valuenow'))).toBeLessThanOrEqual(100)
  })
})
