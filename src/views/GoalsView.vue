<script setup lang="ts">
import { computed } from 'vue'
import GoalList from '@/components/goals/GoalList.vue'
import { useIncomeStore } from '@/stores/incomeStore'
import { useSettingsStore } from '@/stores/settingsStore'

const settings = useSettingsStore()
const income = useIncomeStore()

// Approximate savings bucket as 15% of gross income; allocationStore will refine this in T-070.
const savingsBucket = computed(() => Math.max(0, income.state.grossSalary * 0.15))
</script>

<template>
  <section class="mx-auto flex max-w-2xl flex-col gap-6 p-6">
    <header>
      <h1 class="text-xl font-semibold">
        Metas
      </h1>
    </header>
    <GoalList
      :savings-bucket="savingsBucket"
      :currency="settings.state.currency"
    />
  </section>
</template>
