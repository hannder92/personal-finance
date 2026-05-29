import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import NavBottomSheet from '@/components/common/NavBottomSheet.vue'
import { i18n } from '@/i18n'

const stub = { template: '<div />' }
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/income', name: 'income', component: stub },
    { path: '/expenses', name: 'expenses', component: stub },
    { path: '/variable', name: 'variable', component: stub },
    { path: '/allocation', name: 'allocation', component: stub },
    { path: '/debts', name: 'debts', component: stub },
    { path: '/goals', name: 'goals', component: stub },
    { path: '/networth', name: 'networth', component: stub },
    { path: '/history', name: 'history', component: stub },
    { path: '/settings', name: 'settings', component: stub },
  ],
})

const teleportStub = { template: '<div><slot /></div>' }

const renderSheet = (groupId: 'money' | 'plan' | 'more') =>
  render(NavBottomSheet, {
    props: { open: true, groupId },
    global: {
      plugins: [i18n, router],
      stubs: { Teleport: teleportStub },
    },
    attachTo: document.body,
  })

describe('NavBottomSheet (TC-C-021 … TC-C-023, TC-C-027, TC-C-034)', () => {
  it('TC-C-021: money group lists four destinations', () => {
    renderSheet('money')
    expect(screen.getByText('Ingresos')).toBeTruthy()
    expect(screen.getByText('Gastos fijos')).toBeTruthy()
    expect(screen.getByText('Variables')).toBeTruthy()
    expect(screen.getByText('Distribución')).toBeTruthy()
  })

  it('TC-C-022: plan group lists debts and goals', () => {
    renderSheet('plan')
    expect(screen.getByText('Deudas')).toBeTruthy()
    expect(screen.getByText('Metas')).toBeTruthy()
  })

  it('TC-C-034 (AC-3.7): destination links and close use legible text in dark theme', () => {
    document.documentElement.classList.add('dark')
    try {
      const money = renderSheet('money')
      expect(screen.getByRole('link', { name: 'Ingresos' }).className).toMatch(
        /dark:text-slate-200/
      )
      money.unmount()
      const more = renderSheet('more')
      expect(screen.getByText('Cerrar').className).toMatch(/dark:text-slate-200/)
      more.unmount()
    } finally {
      document.documentElement.classList.remove('dark')
    }
  })

  it('TC-C-027: closes when close button clicked', async () => {
    const { emitted } = renderSheet('more')
    await fireEvent.click(screen.getByText('Cerrar'))
    expect(emitted()['update:open']?.[0]).toEqual([false])
  })
})
