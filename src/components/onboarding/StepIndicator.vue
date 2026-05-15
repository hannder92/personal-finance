<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    current?: number
    total?: number
  }>(),
  { current: 1, total: 3 }
)

const percent = computed(() => Math.max(0, Math.min(100, (props.current / props.total) * 100)))
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="text-sm text-slate-600 dark:text-slate-300">
      {{ current }} / {{ total }}
    </div>
    <div
      role="progressbar"
      :aria-valuenow="current"
      :aria-valuemin="0"
      :aria-valuemax="total"
      class="h-2 w-full overflow-hidden rounded bg-slate-200 dark:bg-slate-700"
    >
      <div
        data-progress-inner
        class="h-full bg-blue-600 transition-all"
        :style="{ width: `${percent}%` }"
      />
    </div>
  </div>
</template>
