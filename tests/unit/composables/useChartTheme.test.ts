import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useChartTheme } from '@/composables/useChartTheme'
import { useTheme } from '@/composables/useTheme'

describe('useChartTheme (T-048)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.documentElement.classList.remove('dark')
  })
  afterEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it('returns options with light text/grid colors when theme=light', () => {
    const { setTheme } = useTheme()
    setTheme('light')
    const { options } = useChartTheme()
    expect(options.value.color).not.toMatch(/#fff|#ffffff/i)
  })

  it('returns options with light text/grid colors when theme=dark', () => {
    const { setTheme } = useTheme()
    setTheme('dark')
    const { options } = useChartTheme()
    // dark mode → light text
    expect(options.value.color).toMatch(/#(e|f|c|d)|rgb/i)
  })

  it('options reacts to theme change', () => {
    const { setTheme } = useTheme()
    setTheme('light')
    const { options } = useChartTheme()
    const lightColor = options.value.color
    setTheme('dark')
    expect(options.value.color).not.toBe(lightColor)
  })
})
