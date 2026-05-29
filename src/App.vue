<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DesktopNav from '@/components/common/DesktopNav.vue'
import LanguageToggle from '@/components/common/LanguageToggle.vue'
import MobileBottomNav from '@/components/common/MobileBottomNav.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import { useLocale } from '@/composables/useLocale'
import { useTheme } from '@/composables/useTheme'

const { t } = useI18n()
const { theme, setTheme } = useTheme()
const { locale, setLocale } = useLocale()
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

        <DesktopNav />

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

    <MobileBottomNav />
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
