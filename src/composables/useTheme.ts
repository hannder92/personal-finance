import { computed, onUnmounted, ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'

type Theme = 'system' | 'light' | 'dark'

// Module-level singleton so multiple useTheme() calls share reactive state.
const sharedIsDark = ref(false)
let mediaQueryWired = false

function prefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

function applyHtmlClass(theme: Theme): void {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else if (theme === 'light') root.classList.remove('dark')
  else root.classList.toggle('dark', prefersDark())
  sharedIsDark.value = root.classList.contains('dark')
}

export function useTheme() {
  const settings = useSettingsStore()
  const theme = computed<Theme>(() => settings.state.theme)

  watch(
    theme,
    (val) => {
      applyHtmlClass(val)
    },
    { immediate: true }
  )

  if (
    !mediaQueryWired &&
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function'
  ) {
    mediaQueryWired = true
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onSystemChange = () => {
      if (settings.state.theme === 'system') applyHtmlClass('system')
    }
    mql.addEventListener('change', onSystemChange)
    onUnmounted(() => mql.removeEventListener('change', onSystemChange))
  }

  function setTheme(next: Theme) {
    settings.setTheme(next)
    applyHtmlClass(next)
  }

  return { isDark: sharedIsDark, theme, setTheme }
}
