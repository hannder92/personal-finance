<script setup lang="ts">
import LucideIcon from '@/components/common/LucideIcon.vue'

withDefaults(
  defineProps<{
    status?: 'success' | 'warning' | 'danger' | 'info'
    label?: string
  }>(),
  { status: 'info', label: '' }
)

const STATUS_CLASS: Record<string, string> = {
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
}

const STATUS_ICON: Record<string, string> = {
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'alert-octagon',
  info: 'info',
}
</script>

<template>
  <span
    :data-status="status"
    :class="[
      'inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium',
      STATUS_CLASS[status],
    ]"
  >
    <LucideIcon
      :name="STATUS_ICON[status]"
      icon-class="h-3 w-3"
    />
    {{ label }}
  </span>
</template>
