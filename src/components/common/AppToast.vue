<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const props = withDefaults(
  defineProps<{
    message?: string
    timeout?: number
    variant?: 'info' | 'success' | 'warning' | 'danger'
  }>(),
  {
    message: '',
    timeout: 3000,
    variant: 'info',
  }
)

const emit = defineEmits<{
  (e: 'dismiss'): void
}>()

let timerId: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  if (props.timeout > 0) {
    timerId = setTimeout(() => emit('dismiss'), props.timeout)
  }
})

onUnmounted(() => {
  if (timerId !== undefined) clearTimeout(timerId)
})

const variantClass: Record<string, string> = {
  info: 'bg-blue-600',
  success: 'bg-green-600',
  warning: 'bg-amber-500',
  danger: 'bg-red-600',
}
</script>

<template>
  <div
    :data-variant="variant"
    :class="[
      'fixed bottom-4 right-4 z-50 rounded px-4 py-2 text-sm text-white shadow',
      variantClass[variant],
    ]"
    role="status"
    aria-live="polite"
  >
    {{ message }}
  </div>
</template>
