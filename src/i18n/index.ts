import { createI18n } from 'vue-i18n'
import es from './es.json'
import en from './en.json'

export type AppLocale = 'es' | 'en'

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'es',
  fallbackLocale: 'en',
  messages: { es, en },
})

export function setLocale(locale: AppLocale): void {
  i18n.global.locale.value = locale
  document.documentElement.setAttribute('lang', locale)
}
