import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import AssetList from '@/components/networth/AssetList.vue'
import { useAssetsStore } from '@/stores/assetsStore'

function mount() {
  return render(AssetList, {
    props: { currency: 'COP' },
    global: {
      plugins: [
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
                onboarding: { done: true, currentStep: 0, totalSteps: 3 },
              },
            },
            assets: { state: { items: [] } },
          },
        }),
      ],
    },
  })
}

describe('AssetList (AC-9.1 TC-C-023)', () => {
  it('AC-9.1 TC-C-023: adding an asset via form increases assets total', async () => {
    mount()
    const store = useAssetsStore()
    expect(store.state.items.length).toBe(0)

    await fireEvent.update(screen.getByRole('textbox', { name: /nombre|name/i }), 'Savings')
    await fireEvent.update(screen.getByRole('textbox', { name: /valor|value/i }), '10000000')
    await fireEvent.update(screen.getByRole('combobox', { name: /tipo|type/i }), 'savings')
    await fireEvent.click(screen.getByRole('button', { name: /agregar|add/i }))

    expect(store.state.items.length).toBe(1)
    expect(store.state.items[0]!.value).toBe(10_000_000)
    expect(screen.getByText('Savings')).toBeTruthy()
  })
})
