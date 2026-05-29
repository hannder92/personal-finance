<script setup lang="ts">
import LucideIcon from '@/components/common/LucideIcon.vue'

defineProps<{
  icon?: string
  message?: string
  ctaLabel?: string
  ctaTo?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 p-8 text-center">
    <LucideIcon
      v-if="icon"
      :name="icon"
      icon-class="h-10 w-10 text-slate-400"
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
