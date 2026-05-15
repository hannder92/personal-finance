<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    current?: number
    previous?: number | null
    label?: string
  }>(),
  { current: 0, previous: null, label: '' }
)

const delta = computed(() => {
  if (props.previous === null || props.previous === undefined) return null
  return props.current - props.previous
})

const direction = computed<'up' | 'down' | 'flat' | null>(() => {
  if (delta.value === null) return null
  if (delta.value > 0) return 'up'
  if (delta.value < 0) return 'down'
  return 'flat'
})

const arrow = computed(() => {
  if (direction.value === 'up') return '↑'
  if (direction.value === 'down') return '↓'
  return '→'
})

const formattedDelta = computed(() => {
  if (delta.value === null) return ''
  if (delta.value > 0) return `+${delta.value}`
  return String(delta.value)
})

const stateClass = computed(() => {
  if (direction.value === 'up')
    return 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-200'
  if (direction.value === 'down') return 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-200'
  return 'text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-200'
})
</script>

<template>
  <span
    v-if="direction !== null"
    :data-direction="direction"
    :class="['inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium', stateClass]"
  >
    <span aria-hidden="true">{{ arrow }}</span>
    {{ formattedDelta }}
    <span
      v-if="label"
      class="text-slate-500"
    >
      {{ label }}
    </span>
  </span>
</template>
