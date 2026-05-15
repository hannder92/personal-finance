import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useLocale } from '@/composables/useLocale'
import { useSettingsStore } from '@/stores/settingsStore'
import { i18n } from '@/i18n'

describe('useLocale (T-048)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    i18n.global.locale.value = 'es'
  })

  it('setLocale("en") updates settingsStore.lang and vue-i18n locale', () => {
    const settings = useSettingsStore()
    const { setLocale } = useLocale()
    setLocale('en')
    expect(settings.state.lang).toBe('en')
    expect(i18n.global.locale.value).toBe('en')
  })

  it('locale ref reflects current settingsStore.lang', () => {
    const { locale, setLocale } = useLocale()
    expect(locale.value).toBe('es')
    setLocale('en')
    expect(locale.value).toBe('en')
  })

  it('setLocale ignores invalid input (state unchanged)', () => {
    const settings = useSettingsStore()
    const { setLocale } = useLocale()
    // @ts-expect-error — invalid locale
    setLocale('fr')
    expect(settings.state.lang).toBe('es')
  })
})
