import { render, screen, fireEvent } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { TooltipProvider } from 'radix-vue'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import { i18n } from '@/i18n'

const Wrapper = defineComponent({
  name: 'KpiCardTestWrapper',
  props: { kpi: { type: Object, required: true } },
  setup(props) {
    return () =>
      h(TooltipProvider, { delayDuration: 0 }, () => [h(KpiCard, props.kpi as Record<string, unknown>)])
  },
})

function mount(props: Record<string, unknown>) {
  return render(Wrapper, {
    props: { kpi: props },
    global: { plugins: [i18n] },
  })
}

void vi // keep import for parity with other test files

describe('KpiCard (AC-10.3 AC-17.6 TC-C-025)', () => {
  it('AC-10.3 TC-C-025: DTI > threshold renders alert color status', () => {
    mount({ label: 'DTI', value: 45, type: 'dti', threshold: 36 })
    const root = document.querySelector('[data-risk]') as HTMLElement
    expect(['warn', 'danger']).toContain(root.getAttribute('data-risk'))
  })

  it('AC-17.6 TC-C-025: DTI at risk also exposes a non-color indicator (icon or label)', () => {
    mount({ label: 'DTI', value: 45, type: 'dti', threshold: 36 })
    const hasIcon = !!document.querySelector('[data-icon]')
    const text = document.body.textContent ?? ''
    const hasContext = /riesgo|risk|alto|deuda/i.test(text)
    expect(hasIcon || hasContext).toBe(true)
  })

  it('AC-10.3 TC-C-025: DTI within safe range renders ok status', () => {
    mount({ label: 'DTI', value: 20, type: 'dti', threshold: 36 })
    const root = document.querySelector('[data-risk]') as HTMLElement
    expect(root.getAttribute('data-risk')).toBe('ok')
  })

  it('AC-10.1 TC-C-024: renders label and formatted value', () => {
    mount({ label: 'Ingreso bruto', value: 5_000_000, type: 'income', currency: 'COP' })
    expect(screen.getByText('Ingreso bruto')).toBeTruthy()
    expect(screen.getByText(/\$\s*5\.000\.000/)).toBeTruthy()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// sprint1-mejoras-finanzas (AC-2.1, AC-2.6, AC-2.7) · TC-C-005, TC-C-010, TC-C-011
// ─────────────────────────────────────────────────────────────────────────────

async function openTooltip(trigger: HTMLElement) {
  await fireEvent.pointerEnter(trigger)
  await fireEvent.mouseEnter(trigger)
  await fireEvent.focus(trigger)
  // Allow radix-vue's delay timer to elapse and the tooltip to mount.
  await new Promise((resolve) => setTimeout(resolve, 50))
}

describe('KpiCard tooltip — sprint1 (AC-2.1, AC-2.6, AC-2.7)', () => {
  it('TC-C-005 (AC-2.1): pointer hover on DTI info trigger reveals tooltip with /deuda/i and thresholds 20/36', async () => {
    mount({ label: 'DTI', value: 30, type: 'dti', threshold: 36 })
    const trigger = screen.queryByTestId('kpi-card-tooltip-trigger')
    expect(trigger).toBeTruthy()
    if (!trigger) return
    await openTooltip(trigger)
    const tips = screen.queryAllByRole('tooltip')
    expect(tips.length).toBeGreaterThan(0)
    const tip = tips[0]
    expect(tip).toBeTruthy()
    const allText = screen.queryAllByRole('tooltip').map((el) => el.textContent ?? '').join(' ')
    expect(allText).toMatch(/deuda/i)
    expect(allText).toMatch(/20/)
    expect(allText).toMatch(/36/)
  })

  it('TC-C-010 (AC-2.6): tooltip stays within a 375px viewport (no right overflow)', async () => {
    const originalWidth = window.innerWidth
    Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true, writable: true })
    try {
      mount({ label: 'DTI', value: 30, type: 'dti', threshold: 36 })
      const trigger = screen.queryByTestId('kpi-card-tooltip-trigger')
      expect(trigger).toBeTruthy()
      if (!trigger) return
      await openTooltip(trigger)
      const tips = screen.queryAllByRole('tooltip')
      expect(tips.length).toBeGreaterThan(0)
      const visibleTip = tips.find((el) => {
        const style = (el as HTMLElement).getAttribute('style') ?? ''
        return !style.includes('width: 1px') && !style.includes('clip:')
      }) ?? tips[0]
      const rect = (visibleTip as HTMLElement).getBoundingClientRect()
      expect(rect.right).toBeLessThanOrEqual(375)
    } finally {
      Object.defineProperty(window, 'innerWidth', { value: originalWidth, configurable: true, writable: true })
    }
  })

  it('TC-C-011 (AC-2.7): tooltip opens via keyboard focus and content matches hover', async () => {
    mount({ label: 'DTI', value: 30, type: 'dti', threshold: 36 })
    const trigger = screen.queryByTestId('kpi-card-tooltip-trigger') as HTMLElement | null
    expect(trigger).toBeTruthy()
    if (!trigger) return
    trigger.focus()
    await fireEvent.focus(trigger)
    await new Promise((resolve) => setTimeout(resolve, 50))
    const allText = screen.queryAllByRole('tooltip').map((el) => el.textContent ?? '').join(' ')
    expect(allText).toMatch(/deuda/i)
  })
})
