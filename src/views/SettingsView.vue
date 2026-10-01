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

// US-1 AC-1.3: optional greeting name. Mirrors settingsStore guard (≤30 chars);
// over-limit input shows the error inline and is not persisted.
const settingsStore = useSettingsStore()
const userName = ref(settingsStore.state.userName)
const userNameError = ref(false)

function onUserNameInput() {
  if (userName.value.trim().length > 30) {
    userNameError.value = true
    return
  }
  userNameError.value = false
  settingsStore.setUserName(userName.value)
}

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

    <div
      class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
    >
      <label
        for="settings-username"
        class="block text-sm font-medium"
      >
        {{ $t('settings.userName.label') }}
      </label>
      <input
        id="settings-username"
        v-model="userName"
        data-testid="settings-username-input"
        type="text"
        maxlength="40"
        :placeholder="$t('settings.userName.placeholder')"
        :aria-invalid="userNameError"
        class="mt-2 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-600"
        @input="onUserNameInput"
      >
      <p
        v-if="userNameError"
        data-testid="settings-username-error"
        role="alert"
        class="mt-1 text-xs text-red-600 dark:text-red-400"
      >
        {{ $t('settings.userName.error') }}
      </p>
      <p
        v-else
        class="mt-1 text-xs text-slate-500 dark:text-slate-400"
      >
        {{ $t('settings.userName.hint') }}
      </p>
    </div>

    <SettingsPanel
      @export="onExport"
      @import="onImport"
      @reset="onReset"
    />
  </section>
</template>
