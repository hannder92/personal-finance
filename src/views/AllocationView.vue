<script setup lang="ts">
import { computed } from 'vue'
import AllocationPanel from '@/components/allocation/AllocationPanel.vue'
import { useIncomeStore } from '@/stores/incomeStore'
import { useSettingsStore } from '@/stores/settingsStore'

const settings = useSettingsStore()
const income = useIncomeStore()

const totalIncome = computed(() => income.state.grossSalary)
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
