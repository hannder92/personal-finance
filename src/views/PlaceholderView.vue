<script setup lang="ts">
defineProps<{ name: string; taskId?: string }>()
</script>

<template>
  <section class="p-6">
    <h2 class="text-xl font-semibold">
      {{ name }}
    </h2>
    <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
      Placeholder view{{ taskId ? ` (implemented in ${taskId})` : '' }}.
    </p>
  </section>
</template>
