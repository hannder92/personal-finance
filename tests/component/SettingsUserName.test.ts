// T-009 — Covers: AC-1.3, EC-2 · TC-I-002
import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import SettingsView from '@/views/SettingsView.vue'
import { i18n } from '@/i18n'
import { useSettingsStore } from '@/stores/settingsStore'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', name: 'dashboard', component: { template: '<div />' } }],
})

function mountSettings(userName = '') {
  return render(SettingsView, {
    global: {
      plugins: [
        i18n,
        router,
        createTestingPinia({
          createSpy: vi.fn,
          stubActions: false,
          initialState: {
            settings: {
              state: {
                lang: 'es',
                currency: 'COP',
                theme: 'system',
                payoffMethod: 'avalanche',
                lastMonthSeen: null,
                projectionAnnualRatePercent: 0,
                userName,
              },
            },
          },
        }),
      ],
    },
  })
}

describe('SettingsView — userName field (TC-I-002)', () => {
  it('AC-1.3: optional name input exists with i18n label and updates the store', async () => {
    mountSettings()
    const input = screen.getByTestId<HTMLInputElement>('settings-username-input')
    expect(input.required).toBe(false)
    await fireEvent.update(input, 'Johann')
    const store = useSettingsStore()
    expect(store.state.userName).toBe('Johann')
  })

  it('AC-1.3: clearing the input resets the name to empty (generic greeting)', async () => {
    mountSettings('Johann')
    const input = screen.getByTestId<HTMLInputElement>('settings-username-input')
    expect(input.value).toBe('Johann')
    await fireEvent.update(input, '')
    const store = useSettingsStore()
    expect(store.state.userName).toBe('')
  })

  it('EC-2: a 31+ char name shows the error copy and does not persist', async () => {
    mountSettings()
    const input = screen.getByTestId<HTMLInputElement>('settings-username-input')
    await fireEvent.update(input, 'x'.repeat(31))
    expect(screen.getByTestId('settings-username-error').textContent).toContain(
      'Máximo 30 caracteres'
    )
    const store = useSettingsStore()
    expect(store.state.userName).toBe('')
  })
})
