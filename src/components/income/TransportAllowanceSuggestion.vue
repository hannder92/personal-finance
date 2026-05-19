<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTransportAllowance } from '@/composables/useTransportAllowance'

const { t } = useI18n()
const allowance = useTransportAllowance()

function onAccept() {
  allowance.accept()
}

function onDismiss() {
  allowance.dismiss()
}
</script>

<template>
  <section
    v-if="allowance.shouldShow.value"
    data-testid="transport-suggestion-banner"
    class="flex flex-col gap-2 rounded border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950"
  >
    <h3 class="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
      {{ t('income.transport.suggestion.title') }}
    </h3>
    <p class="text-xs text-emerald-800 dark:text-emerald-200">
      {{ t('income.transport.suggestion.body') }}
    </p>
    <div class="flex gap-2">
      <button
        type="button"
        class="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
        @click="onAccept"
      >
        {{ t('income.transport.suggestion.accept') }}
      </button>
      <button
        type="button"
        class="rounded border border-emerald-300 px-3 py-1.5 text-xs text-emerald-900 dark:text-emerald-100"
        @click="onDismiss"
      >
        {{ t('income.transport.suggestion.dismiss') }}
      </button>
    </div>
  </section>
</template>
