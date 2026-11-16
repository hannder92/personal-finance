<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AllocationPanel from '@/components/allocation/AllocationPanel.vue'
import { useNetIncome } from '@/composables/useNetIncome'
import { useSettingsStore } from '@/stores/settingsStore'

const settings = useSettingsStore()
const { netIncome: totalIncome } = useNetIncome()

const { t } = useI18n()
</script>

<template>
  <section class="mx-auto flex max-w-2xl flex-col gap-6 p-6">
    <header>
      <h1 class="text-xl font-semibold">
        {{ t('allocationView.title') }}
      </h1>
    </header>
    <AllocationPanel
      :total-income="totalIncome"
      :currency="settings.state.currency"
    />
  </section>
</template>
