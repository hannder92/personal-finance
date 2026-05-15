<script setup lang="ts">
defineProps<{
  icon?: string
  message?: string
  ctaLabel?: string
  ctaTo?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 p-8 text-center">
    <span
      v-if="icon"
      :data-icon="icon"
      class="inline-block h-10 w-10 text-slate-400"
      aria-hidden="true"
    />
    <p
      v-if="message"
      class="text-slate-600 dark:text-slate-300"
    >
      {{ message }}
    </p>
    <a
      v-if="ctaLabel && ctaTo"
      :href="ctaTo"
      class="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
    >
      {{ ctaLabel }}
    </a>
  </div>
</template>
