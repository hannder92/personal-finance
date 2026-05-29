import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import DesktopNav from '@/components/common/DesktopNav.vue'
import { i18n } from '@/i18n'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: { template: '<div />' } },
    { path: '/income', name: 'income', component: { template: '<div />' } },
    { path: '/goals', name: 'goals', component: { template: '<div />' } },
  ],
})

describe('DesktopNav (TC-C-010 … TC-C-033)', () => {
  it('TC-C-033 (AC-3.7): dropdown links use legible text in dark theme', async () => {
    document.documentElement.classList.add('dark')
    try {
      router.push('/')
      await router.isReady()
      render(DesktopNav, {
        global: { plugins: [i18n, router, createTestingPinia({ createSpy: vi.fn })] },
      })
      await fireEvent.click(screen.getByText('Dinero'))
      const incomeLink = screen.getByText('Ingresos').closest('a')
      expect(incomeLink?.className).toMatch(/dark:text-slate-200/)
    } finally {
      document.documentElement.classList.remove('dark')
    }
  })

  it('TC-C-010: renders four navigation groups', async () => {
    router.push('/')
    await router.isReady()
    render(DesktopNav, {
      global: {
        plugins: [i18n, router, createTestingPinia({ createSpy: vi.fn })],
      },
    })
    expect(screen.getByText('Inicio')).toBeTruthy()
    expect(screen.getByText('Dinero')).toBeTruthy()
    expect(screen.getByText('Plan')).toBeTruthy()
    expect(screen.getByText('Más')).toBeTruthy()
  })

  it('TC-C-012: home link navigates without dropdown', async () => {
    router.push('/income')
    await router.isReady()
    const { container } = render(DesktopNav, {
      global: { plugins: [i18n, router, createTestingPinia({ createSpy: vi.fn })] },
    })
    const homeLink = container.querySelector('[data-nav-group="home"]')
    expect(homeLink?.tagName).toBe('A')
    expect(screen.queryByTestId('nav-dropdown-home')).toBeNull()
  })

  it('TC-C-013: opens money dropdown on click', async () => {
    router.push('/')
    await router.isReady()
    render(DesktopNav, {
      global: { plugins: [i18n, router, createTestingPinia({ createSpy: vi.fn })] },
    })
    const trigger = screen.getByText('Dinero')
    await fireEvent.click(trigger)
    expect(screen.getByTestId('nav-dropdown-money')).toBeTruthy()
    expect(screen.getByText('Ingresos')).toBeTruthy()
  })

  it('TC-C-014: closes dropdown after selecting item', async () => {
    router.push('/')
    await router.isReady()
    render(DesktopNav, {
      global: { plugins: [i18n, router, createTestingPinia({ createSpy: vi.fn })] },
    })
    await fireEvent.click(screen.getByText('Plan'))
    const goals = await screen.findByText('Metas')
    await fireEvent.click(goals)
    expect(screen.getByTestId('nav-dropdown-plan').getAttribute('data-state')).toBe('closed')
  })
})
