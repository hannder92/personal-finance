<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import SettingsPanel from '@/components/settings/SettingsPanel.vue'
import { useImportExport } from '@/composables/useImportExport'
import { useStoragePersistence } from '@/composables/useStoragePersistence'
import { STORAGE_KEY } from '@/lib/storage/keys'
import { useAssetsStore } from '@/stores/assetsStore'
import { useCardsStore } from '@/stores/cardsStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useGoalsStore } from '@/stores/goalsStore'
import { useIncomeStore } from '@/stores/incomeStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSnapshotsStore } from '@/stores/snapshotsStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'

const router = useRouter()
const { t, d } = useI18n()
const { exportToFile, importFromFile, lastExportAt } = useImportExport()
const { status: persistStatus, request: requestPersist } = useStoragePersistence()

const lastExportLabel = computed(() =>
  lastExportAt.value
    ? t('settings.data.lastExport', { date: d(new Date(lastExportAt.value)) })
    : t('settings.data.neverExported')
)

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
    errorMsg.value = t('settings.data.importError', { reason: result.error ?? 'invalid_backup' })
    return
  }
  successMsg.value = t('settings.data.importSuccess')
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

  localStorage.removeItem(STORAGE_KEY)
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

    <div
      class="rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-800"
      data-testid="settings-data-safety"
    >
      <h2 class="font-medium">
        {{ $t('settings.data.title') }}
      </h2>
      <p class="mt-1 text-slate-600 dark:text-slate-300">
        {{ $t('settings.data.localOnly') }}
      </p>
      <p
        class="mt-2 text-slate-600 dark:text-slate-300"
        data-testid="settings-last-export"
      >
        {{ lastExportLabel }}
      </p>
      <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {{ $t('settings.data.importReplaces') }}
      </p>
      <div
        v-if="persistStatus !== 'unknown' && persistStatus !== 'unsupported'"
        class="mt-3 flex flex-wrap items-center gap-2"
      >
        <span data-testid="settings-persist-status">
          {{ $t(`settings.data.persist.${persistStatus}`) }}
        </span>
        <button
          v-if="persistStatus === 'best_effort'"
          type="button"
          class="rounded bg-slate-200 px-3 py-1 text-xs font-medium dark:bg-slate-700"
          @click="requestPersist"
        >
          {{ $t('settings.data.persist.request') }}
        </button>
      </div>
    </div>

    <SettingsPanel
      @export="onExport"
      @import="onImport"
      @reset="onReset"
    />
  </section>
</template>
