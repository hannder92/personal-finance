<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDashboardGuide } from '@/composables/useDashboardGuide'

const { t } = useI18n()
const guide = useDashboardGuide()

const content = computed(() => {
  const target = guide.ctaTarget.value
  if (target === 'income') {
    return {
      title: t('dashboard.guide.income.title'),
      body: t('dashboard.guide.income.body'),
      cta: t('dashboard.guide.income.cta'),
      to: '/income',
    }
  }
  if (target === 'expenses') {
    return {
      title: t('dashboard.guide.expenses.title'),
      body: t('dashboard.guide.expenses.body'),
      cta: t('dashboard.guide.expenses.cta'),
      to: '/expenses',
    }
  }
  return null
})
</script>

<template>
  <section
    v-if="guide.shouldShow.value && content"
    data-testid="dashboard-empty-state"
    class="flex flex-col gap-2 rounded border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950"
  >
    <h2 class="text-sm font-semibold text-blue-900 dark:text-blue-100">
      {{ content.title }}
    </h2>
    <p class="text-xs text-blue-800 dark:text-blue-200">
      {{ content.body }}
    </p>
    <RouterLink
      :to="content.to"
      class="self-start rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
    >
      {{ content.cta }}
    </RouterLink>
  </section>
</template>
