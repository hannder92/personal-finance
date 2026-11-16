<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <section
    class="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-16 text-center"
    data-testid="not-found"
  >
    <p class="text-5xl font-semibold text-slate-300 dark:text-slate-700">
      404
    </p>
    <h1 class="text-xl font-semibold">
      {{ t('notFound.title') }}
    </h1>
    <p class="text-sm text-slate-600 dark:text-slate-400">
      {{ t('notFound.body') }}
    </p>
    <RouterLink
      to="/"
      class="mt-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
    >
      {{ t('notFound.cta') }}
    </RouterLink>
  </section>
</template>
