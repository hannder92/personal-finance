<script setup lang="ts">
import GoalList from '@/components/goals/GoalList.vue'
import { useGoalsBudget } from '@/composables/useGoalsBudget'
import { useSettingsStore } from '@/stores/settingsStore'

const settings = useSettingsStore()
const { goalCap } = useGoalsBudget()
</script>

<template>
  <section class="mx-auto flex max-w-2xl flex-col gap-6 p-6">
    <header>
      <h1 class="text-xl font-semibold">
        Metas
      </h1>
    </header>
    <GoalList
      :savings-bucket="goalCap"
      :currency="settings.state.currency"
    />
  </section>
</template>
