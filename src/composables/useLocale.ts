import { computed } from 'vue'
import { i18n, setLocale as setI18nLocale, type AppLocale } from '@/i18n'
import { useSettingsStore } from '@/stores/settingsStore'

const ALLOWED: AppLocale[] = ['es', 'en']

export function useLocale() {
  const settings = useSettingsStore()
  const locale = computed(() => settings.state.lang)

  function setLocale(next: AppLocale) {
    if (!ALLOWED.includes(next)) return
    settings.setLang(next)
    setI18nLocale(next)
  }

  // Keep i18n in sync if the store changes elsewhere (e.g., on app boot).
  if (i18n.global.locale.value !== settings.state.lang) {
    setI18nLocale(settings.state.lang)
  }

  return { locale, setLocale }
}
