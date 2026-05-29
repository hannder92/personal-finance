<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SettingsPanel from '@/components/settings/SettingsPanel.vue'
import { useImportExport } from '@/composables/useImportExport'
import { useAssetsStore } from '@/stores/assetsStore'
import { useCardsStore } from '@/stores/cardsStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useGoalsStore } from '@/stores/goalsStore'
import { useIncomeStore } from '@/stores/incomeStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSnapshotsStore } from '@/stores/snapshotsStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'

const router = useRouter()
const { exportToFile, importFromFile } = useImportExport()

const errorMsg = ref('')
const successMsg = ref('')

function onExport() {
  exportToFile()
}

async function onImport(file: File) {
  errorMsg.value = ''
  successMsg.value = ''
  const result = await importFromFile(file)
  if (!result.ok) {
    errorMsg.value = result.error ?? 'Import failed'
    return
  }
  successMsg.value = 'Importación correcta'
}

function onReset() {
  const settings = useSettingsStore()
  settings.setLang('es')
  settings.setCurrency('COP')
  settings.setTheme('system')
  settings.setPayoffMethod('avalanche')

  const income = useIncomeStore()
  income.setGrossSalary(0)
  income.state.deductions.splice(0)
  income.state.otherStreams.splice(0)
  income.state.nonSalaryBenefits.splice(0)

  useExpensesStore().state.items.splice(0)
  useCardsStore().state.items.splice(0)
  useGoalsStore().state.items.splice(0)
  useAssetsStore().state.items.splice(0)
  useVariableExpensesStore().state.items.splice(0)
  useSnapshotsStore().state.items.splice(0)

  localStorage.removeItem('personal_finance_v2')
  router.push('/')
}
</script>

<template>
  <section class="mx-auto flex max-w-2xl flex-col gap-6 p-6">
    <header>
      <h1 class="text-xl font-semibold">
        Configuración
      </h1>
    </header>

    <p
      v-if="errorMsg"
      role="alert"
      class="rounded border-l-4 border-l-red-500 bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200"
    >
      {{ errorMsg }}
    </p>
    <p
      v-if="successMsg"
      role="status"
      class="rounded border-l-4 border-l-emerald-500 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
    >
      {{ successMsg }}
    </p>

    <SettingsPanel
      @export="onExport"
      @import="onImport"
      @reset="onReset"
    />
  </section>
</template>
