<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStorageError } from '@/composables/useStorageError'

const { error, retry, clearError } = useStorageError()
const { t } = useI18n()

const message = computed(() => {
  if (!error.value) return ''
  switch (error.value.reason) {
    case 'quota_exceeded':
      return t('storageToast.quota')
    case 'invalid_state':
      return t('storageToast.invalid')
    default:
      return t('storageToast.unknown')
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
    <strong>{{ t('storageToast.title') }}</strong>
    <p class="mt-1">
      {{ message }}
    </p>
    <div class="mt-2 flex gap-2">
      <button
        type="button"
        class="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
        @click="retry()"
      >
        {{ t('storageToast.retry') }}
      </button>
      <button
        type="button"
        class="rounded border border-red-300 px-3 py-1 text-red-900 dark:text-red-100"
        @click="clearError()"
      >
        {{ t('storageToast.dismiss') }}
      </button>
    </div>
  </div>
  <div
    v-else
    data-testid="storage-error-toast"
    hidden
  />
</template>
