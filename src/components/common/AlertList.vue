<script setup lang="ts">
export interface Alert {
  id: string
  message: string
  severity: 'info' | 'warning' | 'danger'
}

withDefaults(
  defineProps<{
    alerts?: Alert[]
  }>(),
  { alerts: () => [] }
)

const SEVERITY_CLASS: Record<string, string> = {
  info: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950',
  warning: 'border-l-amber-500 bg-amber-50 dark:bg-amber-950',
  danger: 'border-l-red-500 bg-red-50 dark:bg-red-950',
}
</script>

<template>
  <ul
    v-if="alerts.length > 0"
    role="list"
    class="flex flex-col gap-2"
  >
    <li
      v-for="alert in alerts"
      :key="alert.id"
      role="listitem"
      :data-alert-item="alert.id"
      :data-severity="alert.severity"
      :class="['rounded border-l-4 px-3 py-2 text-sm', SEVERITY_CLASS[alert.severity]]"
    >
      {{ alert.message }}
    </li>
  </ul>
</template>
