<script setup lang="ts">
import { computed } from 'vue'
import { useIncomeStore } from '@/stores/incomeStore'
import { useSettingsStore } from '@/stores/settingsStore'

const settings = useSettingsStore()
const income = useIncomeStore()

const isCOP = computed(() => settings.state.currency === 'COP')

function onColombiaClick() {
  income.applyColombiaPresets()
}

function onPrimaClick() {
  income.addPrimaPreset()
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-if="isCOP"
      type="button"
      class="rounded bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
      @click="onColombiaClick"
    >
      🇨🇴 Cargar deducciones Colombia
    </button>
    <button
      v-if="isCOP"
      type="button"
      class="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
      @click="onPrimaClick"
    >
      Cargar prima de servicios
    </button>
  </div>
</template>
