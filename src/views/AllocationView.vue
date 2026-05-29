<script setup lang="ts">
import AllocationPanel from '@/components/allocation/AllocationPanel.vue'
import { useNetIncome } from '@/composables/useNetIncome'
import { useSettingsStore } from '@/stores/settingsStore'

const settings = useSettingsStore()
const { netIncome: totalIncome } = useNetIncome()
</script>

<template>
  <section class="mx-auto flex max-w-2xl flex-col gap-6 p-6">
    <header>
      <h1 class="text-xl font-semibold">
        Distribución
      </h1>
    </header>
    <AllocationPanel
      :total-income="totalIncome"
      :currency="settings.state.currency"
    />
  </section>
</template>
