<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  expanded: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col gap-1">
    <button
      type="button"
      data-testid="dashboard-tier2-toggle"
      class="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      :aria-expanded="expanded"
      @click="emit('toggle')"
    >
      {{ expanded ? t('dashboard.tier2.collapse') : t('dashboard.tier2.expand') }}
    </button>
    <p
      v-if="!expanded"
      class="text-sm text-slate-500 dark:text-slate-400"
    >
      {{ t('dashboard.tier2.hint') }}
    </p>
  </div>
</template>
