<script setup lang="ts">
import { computed } from 'vue'
import { useStorageError } from '@/composables/useStorageError'

const { error, retry, clearError } = useStorageError()

const message = computed(() => {
  if (!error.value) return ''
  switch (error.value.reason) {
    case 'quota_exceeded':
      return 'Error al guardar: almacenamiento del navegador lleno.'
    case 'invalid_state':
      return 'Error al guardar: los datos en memoria no son válidos.'
    default:
      return 'Error al guardar los datos.'
  }
})

const visible = computed(() => error.value !== null)
</script>

<template>
  <div
    v-if="visible"
    role="alert"
    aria-live="assertive"
    data-testid="storage-error-toast"
    class="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-lg dark:border-red-700 dark:bg-red-950 dark:text-red-100"
  >
    <strong>{{ 'Error al guardar' }}</strong>
    <p class="mt-1">
      {{ message }}
    </p>
    <div class="mt-2 flex gap-2">
      <button
        type="button"
        class="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
        @click="retry()"
      >
        Reintentar
      </button>
      <button
        type="button"
        class="rounded border border-red-300 px-3 py-1 text-red-900 dark:text-red-100"
        @click="clearError()"
      >
        Descartar
      </button>
    </div>
  </div>
  <div
    v-else
    data-testid="storage-error-toast"
    hidden
  />
</template>
