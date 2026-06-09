<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

// ADR-3: own component instead of extending ComparisonBadge — here "up" is bad
// (spending faster) and "down" is good, the inverse of the health badge.
const props = defineProps<{
  status: 'ahead' | 'below' | 'none'
  spentPct: number
  elapsedPct: number
}>()

const { t } = useI18n()

const delta = computed(() => Math.abs(props.spentPct - props.elapsedPct))

const badgeText = computed(() =>
  props.status === 'ahead'
    ? t('dashboard.pace.badgeAhead', { delta: delta.value })
    : t('dashboard.pace.badgeBelow', { delta: delta.value })
)

const badgeClass = computed(() =>
  props.status === 'ahead'
    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
)

const contextText = computed(() => {
  if (props.status === 'none') return t('dashboard.pace.noHistory')
  const params = { spent: props.spentPct, elapsed: props.elapsedPct }
  return props.status === 'ahead'
    ? t('dashboard.pace.contextAhead', params)
    : t('dashboard.pace.contextBelow', params)
})
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <span
      v-if="status !== 'none'"
      data-testid="pace-badge"
      class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums"
      :class="badgeClass"
    >
      {{ badgeText }}
    </span>
    <p
      data-testid="pace-context"
      class="text-xs text-slate-500 dark:text-slate-400"
    >
      {{ contextText }}
    </p>
  </div>
</template>
