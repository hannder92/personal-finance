<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { formatCurrency } from '@/lib/currency/format'
import { useSettingsStore } from '@/stores/settingsStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'

const { t } = useI18n()
const settings = useSettingsStore()
const variable = useVariableExpensesStore()

const TOP_COUNT = 5

// AC-5.1: top categories with actual spending, highest first; alphabetical
// tie-break keeps the order stable across renders.
const topCategories = computed(() =>
  variable.state.items
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent || a.name.localeCompare(b.name))
    .slice(0, TOP_COUNT)
)
</script>

<template>
  <section :aria-label="t('dashboard.activity.title')">
    <div class="mb-2 flex items-center justify-between">
      <h2 class="text-sm font-medium text-slate-500 dark:text-slate-400">
        {{ t('dashboard.activity.title') }}
      </h2>
      <RouterLink
        v-if="topCategories.length > 0"
        data-testid="activity-view-all"
        to="/variable"
        class="inline-flex min-h-[44px] items-center text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        {{ t('dashboard.activity.viewAll') }}
      </RouterLink>
    </div>

    <ul
      v-if="topCategories.length > 0"
      class="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800"
    >
      <li
        v-for="cat in topCategories"
        :key="cat.id"
        data-testid="activity-row"
        class="flex items-center justify-between gap-3 px-4 py-3"
      >
        <span class="truncate text-sm text-slate-700 dark:text-slate-200">{{ cat.name }}</span>
        <span class="shrink-0 text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-50">
          {{ formatCurrency(cat.spent, settings.state.currency) }}
        </span>
      </li>
    </ul>

    <div
      v-else
      data-testid="activity-empty"
      class="flex flex-col items-start gap-3 rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-600"
    >
      <p class="text-sm text-slate-500 dark:text-slate-400">
        {{ t('dashboard.activity.empty') }}
      </p>
      <RouterLink
        data-testid="activity-empty-cta"
        to="/variable"
        class="inline-flex min-h-[44px] items-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700"
      >
        {{ t('dashboard.activity.emptyCta') }}
      </RouterLink>
    </div>
  </section>
</template>
