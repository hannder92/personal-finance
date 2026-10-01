<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useFinancialRunway } from '@/composables/useFinancialRunway'

const { t } = useI18n()
const { runway } = useFinancialRunway()
</script>

<template>
  <section
    data-testid="runway-card"
    class="card"
  >
    <h2 class="card-title">
      {{ t('runway.title') }}
    </h2>
    <p
      v-if="runway.kind === 'months'"
      data-testid="runway-months"
      class="mt-2 text-2xl font-bold tabular-nums"
    >
      {{ t('runway.months', { count: runway.value }) }}
    </p>
    <p
      v-else
      data-testid="runway-unavailable"
      class="mt-2 text-sm text-slate-600 dark:text-slate-400"
    >
      {{ t(`runway.unavailable.${runway.reason}`) }}
    </p>
    <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
      {{ t('runway.hint') }}
    </p>
  </section>
</template>
