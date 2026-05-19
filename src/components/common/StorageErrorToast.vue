<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStorageError } from '@/composables/useStorageError'

const { t } = useI18n()
const { error, retry, clearError } = useStorageError()

const title = computed(() => {
  if (!error.value) return ''
  return error.value.kind === 'load'
    ? t('storage.errorToast.load.title')
    : t('storage.error.title')
})

const message = computed(() => {
  if (!error.value) return ''
  const { reason, kind } = error.value
  if (kind === 'load') {
    if (reason === 'invalid_json') return t('storage.errorToast.load.invalidJson')
    return t('storage.errorToast.load.invalidState')
  }
  switch (reason) {
    case 'quota_exceeded':
      return t('storage.error.quotaExceeded')
    case 'invalid_state':
      return t('storage.error.invalidState')
    default:
      return t('storage.error.unknownReason')
  }
})

const showRetry = computed(() => error.value?.kind === 'save')
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
    <strong>{{ title }}</strong>
    <p class="mt-1">
      {{ message }}
    </p>
    <div class="mt-2 flex gap-2">
      <button
        v-if="showRetry"
        type="button"
        class="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
        @click="retry()"
      >
        {{ t('storage.error.retry') }}
      </button>
      <button
        type="button"
        class="rounded border border-red-300 px-3 py-1 text-red-900 dark:text-red-100"
        @click="clearError()"
      >
        {{ t('storage.error.dismiss') }}
      </button>
    </div>
  </div>
  <div
    v-else
    data-testid="storage-error-toast"
    hidden
  />
</template>
