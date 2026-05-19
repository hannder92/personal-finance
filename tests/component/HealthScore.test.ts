import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { TooltipProvider } from 'radix-vue'
import HealthScore from '@/components/dashboard/HealthScore.vue'
import { i18n } from '@/i18n'

const Wrapper = defineComponent({
  name: 'HealthScoreTestWrapper',
  props: { hs: { type: Object, required: true } },
  setup(props) {
    return () =>
      h(TooltipProvider, { delayDuration: 0 }, () => [h(HealthScore, props.hs as Record<string, unknown>)])
  },
})

function mountHS(props: Record<string, unknown>) {
  return render(Wrapper, {
    props: { hs: props },
    global: { plugins: [i18n] },
  })
}

async function openBreakdownTooltip(testid: string) {
  const trigger = screen.queryByTestId(testid) as HTMLElement | null
  expect(trigger).toBeTruthy()
  if (!trigger) return null
  await fireEvent.pointerEnter(trigger)
  await fireEvent.mouseEnter(trigger)
  await fireEvent.focus(trigger)
  await new Promise((resolve) => setTimeout(resolve, 50))
  return trigger
}

function visibleTooltipText(): string {
  return screen.queryAllByRole('tooltip').map((el) => el.textContent ?? '').join(' ')
}

describe('HealthScore (AC-11.2 TC-C-027)', () => {
  it('AC-11.2 TC-C-027: clicking opens a breakdown panel with 4 components', async () => {
    render(HealthScore, {
      props: {
        score: 75,
        label: 'Saludable',
        breakdown: { dti: 25, emergency: 80, housing: 28, savings: 18 },
      },
    })

    expect(screen.queryByText(/dti/i)).toBeNull()

    const btn = screen.getByRole('button', { name: /75/ })
    await fireEvent.click(btn)

    expect(screen.getByText(/dti/i)).toBeTruthy()
    expect(screen.getByText(/emergencia|emergency/i)).toBeTruthy()
    expect(screen.getByText(/vivienda|housing/i)).toBeTruthy()
    expect(screen.getByText(/ahorro|savings/i)).toBeTruthy()
  })

  it('AC-11.2 TC-C-027: each breakdown row exposes a semaphore status', async () => {
    render(HealthScore, {
      props: {
        score: 60,
        label: 'Regular',
        breakdown: { dti: 25, emergency: 80, housing: 28, savings: 18 },
      },
    })
    await fireEvent.click(screen.getByRole('button', { name: /60/ }))

    const rows = document.querySelectorAll('[data-component-status]')
    expect(rows.length).toBe(4)
    rows.forEach((r) => {
      expect(['ok', 'warn', 'danger']).toContain(r.getAttribute('data-component-status'))
    })
  })

  it('AC-11.1: renders score and label always', () => {
    render(HealthScore, {
      props: {
        score: 82,
        label: 'Excelente',
        breakdown: { dti: 10, emergency: 100, housing: 20, savings: 25 },
      },
    })
    expect(screen.getByText('82')).toBeTruthy()
    expect(screen.getByText(/excelente/i)).toBeTruthy()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// sprint1-mejoras-finanzas (AC-2.2..2.5) · TC-C-006..009
// ─────────────────────────────────────────────────────────────────────────────

describe('HealthScore tooltips — sprint1 (AC-2.2..2.5)', () => {
  const baseProps = {
    score: 70,
    label: 'Saludable',
    breakdown: { dti: 25, emergency: 80, housing: 28, savings: 18 },
    defaultOpen: true,
  }

  it('TC-C-006 (AC-2.2): housing tooltip mentions vivienda/housing and 30%', async () => {
    mountHS(baseProps)
    await openBreakdownTooltip('health-tooltip-trigger-housing')
    const text = visibleTooltipText()
    expect(text).toMatch(/vivienda|housing/i)
    expect(text).toMatch(/30/)
  })

  it('TC-C-007 (AC-2.3): emergency tooltip mentions emergencia and months range 3..6', async () => {
    mountHS(baseProps)
    await openBreakdownTooltip('health-tooltip-trigger-emergency')
    const text = visibleTooltipText()
    expect(text).toMatch(/emergencia|emergency/i)
    expect(text).toMatch(/3.*6|6.*3/)
  })

  it('TC-C-008 (AC-2.4): savings tooltip mentions ahorro and ingreso', async () => {
    mountHS(baseProps)
    await openBreakdownTooltip('health-tooltip-trigger-savings')
    const text = visibleTooltipText()
    expect(text).toMatch(/ahorro|saving/i)
    expect(text).toMatch(/ingres|income/i)
  })

  it('TC-C-009 (AC-2.5): score-title tooltip mentions 0–100 and four components', async () => {
    mountHS(baseProps)
    await openBreakdownTooltip('health-tooltip-trigger-score')
    const text = visibleTooltipText()
    expect(text).toMatch(/0[\s\-–—]*100|100/)
    expect(text).toMatch(/dti|deuda/i)
    expect(text).toMatch(/vivienda|housing/i)
    expect(text).toMatch(/emergencia|emergency/i)
    expect(text).toMatch(/ahorro|saving/i)
  })
})
