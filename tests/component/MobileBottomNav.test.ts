import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import MobileBottomNav from '@/components/common/MobileBottomNav.vue'
import { i18n } from '@/i18n'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: { template: '<div />' } },
    { path: '/goals', name: 'goals', component: { template: '<div />' } },
  ],
})

describe('MobileBottomNav (TC-C-020, TC-C-025)', () => {
  it('TC-C-020: renders four tabs with icons', async () => {
    router.push('/')
    await router.isReady()
    const { container } = render(MobileBottomNav, {
      global: { plugins: [i18n, router, createTestingPinia({ createSpy: vi.fn })] },
    })
    expect(screen.getByText('Inicio')).toBeTruthy()
    expect(screen.getByText('Dinero')).toBeTruthy()
    expect(screen.getByText('Plan')).toBeTruthy()
    expect(screen.getByText('Más')).toBeTruthy()
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(4)
  })

  it('TC-C-025: home tab is a link without opening sheet', async () => {
    router.push('/')
    await router.isReady()
    render(MobileBottomNav, {
      global: { plugins: [i18n, router, createTestingPinia({ createSpy: vi.fn })] },
    })
    const home = screen.getByText('Inicio').closest('a')
    expect(home).toBeTruthy()
    await fireEvent.click(home!)
    expect(screen.queryByTestId('nav-bottom-sheet')).toBeNull()
  })

  it('TC-C-026: plan tab opens bottom sheet', async () => {
    router.push('/')
    await router.isReady()
    render(MobileBottomNav, {
      global: { plugins: [i18n, router, createTestingPinia({ createSpy: vi.fn })] },
    })
    await fireEvent.click(screen.getByText('Plan'))
    expect(screen.getByTestId('nav-bottom-sheet')).toBeTruthy()
    expect(screen.getByText('Deudas')).toBeTruthy()
    expect(screen.getByText('Metas')).toBeTruthy()
  })
})
