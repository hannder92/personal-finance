<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { Wallet } from 'lucide-vue-next'
import { formatCurrency } from '@/lib/currency/format'
import type { DebtDueSlice } from '@/lib/calculations/day-obligations'
import { useSettingsStore } from '@/stores/settingsStore'

defineProps<{
  payments: DebtDueSlice[]
}>()

const { t } = useI18n()
const settings = useSettingsStore()
</script>

<template>
  <section
    data-testid="day-payments-card"
    class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
  >
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
        <Wallet
          data-testid="day-section-icon"
          class="h-4 w-4"
          aria-hidden="true"
        />
        <span>{{ t('day.payments.title') }}</span>
      </div>
      <RouterLink
        v-if="payments.length > 0"
        data-testid="data-link-debts"
        to="/debts"
        class="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        {{ t('day.payments.viewDebts') }}
      </RouterLink>
    </div>
    <p
      v-if="payments.length === 0"
      class="mt-4 text-sm text-slate-600 dark:text-slate-400"
    >
      {{ t('day.payments.empty') }}
    </p>
    <ul
      v-else
      class="mt-4 flex flex-col gap-3"
      role="list"
    >
      <li
        v-for="p in payments"
        :key="p.id"
        data-testid="data-payment-item"
        class="flex items-center justify-between gap-2 rounded-xl text-sm"
      >
        <span>{{ p.name }}</span>
        <span class="tabular-nums font-medium">
          {{ formatCurrency(p.minPayment, settings.state.currency) }}
        </span>
      </li>
    </ul>
  </section>
</template>
