<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  label: string
  icon: Component
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
    :aria-label="label"
    data-testid="icon-button"
    @click="emit('click')"
  >
    <component
      :is="icon"
      class="h-4 w-4"
      aria-hidden="true"
    />
  </button>
</template>
