<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageToggle from '@/components/common/LanguageToggle.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import { useLocale } from '@/composables/useLocale'
import { useTheme } from '@/composables/useTheme'

const route = useRoute()
const { t } = useI18n()
const { theme, setTheme } = useTheme()
const { locale, setLocale } = useLocale()

const ALL_NAV = computed(() => [
  { name: 'dashboard', label: t('nav.dashboard'), to: '/' },
  { name: 'income', label: t('nav.income'), to: '/income' },
  { name: 'expenses', label: t('nav.expenses'), to: '/expenses' },
  { name: 'debts', label: t('nav.debts'), to: '/debts' },
  { name: 'goals', label: t('nav.goals'), to: '/goals' },
  { name: 'variable', label: t('nav.variable'), to: '/variable' },
  { name: 'networth', label: t('nav.networth'), to: '/networth' },
  { name: 'allocation', label: t('nav.allocation'), to: '/allocation' },
  { name: 'history', label: t('nav.history'), to: '/history' },
  { name: 'settings', label: t('nav.settings'), to: '/settings' },
])

const MOBILE_NAV = computed(() => [
  { name: 'dashboard', label: t('nav.dashboard'), to: '/' },
  { name: 'income', label: t('nav.income'), to: '/income' },
  { name: 'expenses', label: t('nav.expensesMobile'), to: '/expenses' },
  { name: 'debts', label: t('nav.debts'), to: '/debts' },
  { name: 'settings', label: t('nav.settings'), to: '/settings' },
])
</script>

<template>
  <div class="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
    <header
      class="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95"
    >
      <div class="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
        <RouterLink
          to="/"
          class="shrink-0 text-sm font-semibold text-slate-900 dark:text-slate-100"
        >
          {{ t('nav.appName') }}
        </RouterLink>

        <nav
          class="hidden flex-1 overflow-x-auto md:block"
          :aria-label="t('nav.ariaMain')"
        >
          <ul class="flex gap-0.5">
            <li
              v-for="item in ALL_NAV"
              :key="item.name"
            >
              <RouterLink
                :to="item.to"
                class="inline-block rounded px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                :class="{
                  'bg-slate-100 !text-slate-900 dark:bg-slate-800 dark:!text-slate-100':
                    route.name === item.name,
                }"
              >
                {{ item.label }}
              </RouterLink>
            </li>
          </ul>
        </nav>

        <div class="ml-auto flex shrink-0 items-center gap-2">
          <ThemeToggle
            :model-value="theme"
            @update:model-value="setTheme"
          />
          <LanguageToggle
            :model-value="locale"
            @update:model-value="setLocale"
          />
        </div>
      </div>
    </header>

    <main class="pb-16 md:pb-0">
      <RouterView v-slot="{ Component }">
        <Transition
          name="fade"
          mode="out-in"
        >
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <nav
      class="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:hidden"
      :aria-label="t('nav.ariaMain')"
    >
      <ul class="flex">
        <li
          v-for="item in MOBILE_NAV"
          :key="item.name"
          class="flex-1"
        >
          <RouterLink
            :to="item.to"
            class="flex h-14 flex-col items-center justify-center text-xs text-slate-500 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:text-slate-400 dark:hover:text-slate-100"
            :class="{
              'font-semibold text-blue-600 dark:text-blue-400': route.name === item.name,
            }"
          >
            {{ item.label }}
          </RouterLink>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 120ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
