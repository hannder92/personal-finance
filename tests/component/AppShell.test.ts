import { render } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'
import { i18n } from '@/i18n'

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', name: 'dashboard', component: { template: '<div>dash</div>' } }],
})

describe('App shell (TC-C-024)', () => {
  it('TC-C-024: main has mobile bottom padding', async () => {
    router.push('/')
    await router.isReady()
    const { container } = render(App, {
      global: {
        plugins: [i18n, router, createTestingPinia({ createSpy: vi.fn })],
      },
    })
    const main = container.querySelector('main')!
    expect(main.className).toMatch(/pb-16/)
    expect(main.className).toMatch(/md:pb-0/)
  })
})
