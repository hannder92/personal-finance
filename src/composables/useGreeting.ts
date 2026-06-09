// Bridges settingsStore + lib/greeting to the dashboard greeting block (US-1).
// Time is read once at composable setup: the slot only shifts on a fresh mount,
// which is acceptable for a dashboard visit.

import { computed, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { greetingKey } from '@/lib/greeting'
import { useSettingsStore } from '@/stores/settingsStore'

export interface UseGreeting {
  greetingText: ComputedRef<string>
  dateText: ComputedRef<string>
}

export function useGreeting(now: Date = new Date()): UseGreeting {
  const settings = useSettingsStore()
  const { t, locale } = useI18n()

  const greetingText = computed(() => {
    const base = t(`dashboard.greeting.${greetingKey(now.getHours())}`)
    const name = settings.state.userName
    return name ? t('dashboard.greeting.withName', { greeting: base, name }) : base
  })

  const dateText = computed(() =>
    now.toLocaleDateString(locale.value === 'en' ? 'en-US' : 'es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  )

  return { greetingText, dateText }
}
