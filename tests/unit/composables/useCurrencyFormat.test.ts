import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useCurrencyFormat } from '@/composables/useCurrencyFormat'
import { useSettingsStore } from '@/stores/settingsStore'

describe('useCurrencyFormat (T-048)', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('format(1234567) returns COP-grouped string when currency=COP', () => {
    const { format } = useCurrencyFormat()
    expect(format(1_234_567)).toMatch(/\$1\.234\.567/)
  })

  it('reactively switches to USD when settingsStore.currency changes', () => {
    const settings = useSettingsStore()
    const { format } = useCurrencyFormat()

    settings.setCurrency('USD')
    expect(format(100)).toMatch(/\$100/)
  })
})
