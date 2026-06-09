<script setup lang="ts">
import { useGreeting } from '@/composables/useGreeting'

const { greetingText, dateText } = useGreeting()
</script>

<template>
  <header>
    <h1
      data-testid="dashboard-greeting"
      class="text-xl font-semibold tracking-tight"
    >
      {{ greetingText }}
    </h1>
    <p
      data-testid="dashboard-greeting-date"
      class="mt-0.5 text-sm capitalize text-slate-500 dark:text-slate-400"
    >
      {{ dateText }}
    </p>
  </header>
</template>
