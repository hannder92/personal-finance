import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTheme } from '@/composables/useTheme'
import { useSettingsStore } from '@/stores/settingsStore'

describe('useTheme (T-048)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.documentElement.classList.remove('dark')
  })
  afterEach(() => {
    document.documentElement.classList.remove('dark')
    vi.restoreAllMocks()
  })

  it('setTheme("dark") adds "dark" class to <html> and updates store', () => {
    const settings = useSettingsStore()
    const { setTheme } = useTheme()
    setTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(settings.state.theme).toBe('dark')
  })

  it('setTheme("light") removes "dark" class', () => {
    document.documentElement.classList.add('dark')
    const { setTheme } = useTheme()
    setTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('setTheme("system") follows prefers-color-scheme', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
      matches: q.includes('dark'),
      media: q,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    }))
    const { setTheme } = useTheme()
    setTheme('system')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('isDark reflects current html class', () => {
    const { setTheme, isDark } = useTheme()
    setTheme('light')
    expect(isDark.value).toBe(false)
    setTheme('dark')
    expect(isDark.value).toBe(true)
  })
})
