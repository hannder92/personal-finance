<script setup lang="ts">
import { ref } from 'vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useSettingsStore } from '@/stores/settingsStore'

const emit = defineEmits<{
  (e: 'export'): void
  (e: 'import', file: File): void
  (e: 'reset'): void
  (e: 'relaunch'): void
}>()

const settings = useSettingsStore()
const confirmOpen = ref(false)

function onExport() {
  emit('export')
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) emit('import', file)
  target.value = ''
}

function askReset() {
  confirmOpen.value = true
}
function confirmReset() {
  emit('reset')
  confirmOpen.value = false
}
function cancelReset() {
  confirmOpen.value = false
}
function relaunch() {
  emit('relaunch')
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <fieldset class="flex flex-col gap-2 rounded border border-slate-200 p-4 dark:border-slate-700">
      <legend class="text-sm font-semibold">
        Idioma
      </legend>
      <select
        :value="settings.state.lang"
        aria-label="Idioma"
        class="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
        @change="settings.setLang(($event.target as HTMLSelectElement).value as 'es' | 'en')"
      >
        <option value="es">
          Español
        </option>
        <option value="en">
          English
        </option>
      </select>
    </fieldset>

    <fieldset class="flex flex-col gap-2 rounded border border-slate-200 p-4 dark:border-slate-700">
      <legend class="text-sm font-semibold">
        Datos
      </legend>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
          @click="onExport"
        >
          Exportar
        </button>
        <label
          class="cursor-pointer rounded bg-slate-200 px-3 py-1.5 text-sm font-medium dark:bg-slate-800"
        >
          Importar
          <input
            type="file"
            accept=".json,application/json"
            class="sr-only"
            aria-label="Importar"
            @change="onFileChange"
          >
        </label>
        <button
          type="button"
          class="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white"
          @click="askReset"
        >
          Reiniciar
        </button>
      </div>
    </fieldset>

    <fieldset class="flex flex-col gap-2 rounded border border-slate-200 p-4 dark:border-slate-700">
      <legend class="text-sm font-semibold">
        Onboarding
      </legend>
      <button
        type="button"
        class="self-start rounded bg-amber-500 px-3 py-1.5 text-sm font-medium text-white"
        @click="relaunch"
      >
        Relanzar guía de configuración
      </button>
    </fieldset>

    <ConfirmDialog
      v-model:open="confirmOpen"
      title="Reiniciar todos los datos"
      message="Esta acción eliminará todos tus datos guardados localmente. ¿Continuar?"
      confirm-label="Confirmar"
      cancel-label="Cancelar"
      @confirm="confirmReset"
      @cancel="cancelReset"
    />
  </section>
</template>
