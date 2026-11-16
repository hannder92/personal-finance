<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { formatCurrency } from '@/lib/currency/format'
import { useAssetsStore, type AssetType } from '@/stores/assetsStore'

const props = withDefaults(
  defineProps<{
    currency?: string
  }>(),
  { currency: 'COP' }
)

const assets = useAssetsStore()
const { t } = useI18n()

const ASSET_TYPES: readonly AssetType[] = [
  'cash',
  'savings',
  'investment',
  'property',
  'vehicle',
  'other',
]
const total = computed(() => assets.state.items.reduce((acc, a) => acc + a.value, 0))

const name = ref('')
const valueRaw = ref('')
const type = ref<AssetType>('savings')
const rateRaw = ref('')

// annualRatePercent is only meaningful for savings/investment per OQ-P2 (2-plan.md).
const showRateInput = computed(() => type.value === 'savings' || type.value === 'investment')

function onSubmit(event: Event) {
  event.preventDefault()
  const value = Number.parseInt(valueRaw.value.replace(/\D/g, ''), 10) || 0
  if (!name.value.trim() || value <= 0) return
  const rate = showRateInput.value
    ? Math.min(100, Math.max(0, Number.parseFloat(rateRaw.value) || 0))
    : 0
  assets.add({ name: name.value.trim(), value, type: type.value, annualRatePercent: rate })
  name.value = ''
  valueRaw.value = ''
  rateRaw.value = ''
}

const confirmOpen = ref(false)
const pendingDeleteId = ref<string | null>(null)

function askDelete(id: string) {
  pendingDeleteId.value = id
  confirmOpen.value = true
}

function confirmDelete() {
  if (pendingDeleteId.value) assets.remove(pendingDeleteId.value)
  pendingDeleteId.value = null
  confirmOpen.value = false
}

function cancelDelete() {
  pendingDeleteId.value = null
  confirmOpen.value = false
}
</script>

<template>
  <section class="flex flex-col gap-4">
    <form
      class="flex flex-wrap items-end gap-2"
      @submit="onSubmit"
    >
      <label class="flex flex-1 flex-col gap-1">
        <span class="text-xs">{{ t('assetsList.name') }}</span>
        <input
          v-model="name"
          type="text"
          maxlength="60"
          :aria-label="t('assetsList.name')"
          class="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
        >
      </label>
      <label class="flex flex-1 flex-col gap-1">
        <span class="text-xs">{{ t('assetsList.value') }}</span>
        <input
          v-model="valueRaw"
          type="text"
          inputmode="numeric"
          :aria-label="t('assetsList.value')"
          class="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
        >
      </label>
      <label class="flex flex-1 flex-col gap-1">
        <span class="text-xs">{{ t('assetsList.type') }}</span>
        <select
          v-model="type"
          :aria-label="t('assetsList.type')"
          class="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
        >
          <option
            v-for="at in ASSET_TYPES"
            :key="at"
            :value="at"
          >
            {{ t(`assetsList.types.${at}`) }}
          </option>
        </select>
      </label>
      <label
        v-if="showRateInput"
        class="flex flex-1 flex-col gap-1"
      >
        <span class="text-xs">{{ t('assets.annualRatePercent.label') }}</span>
        <input
          v-model="rateRaw"
          type="number"
          min="0"
          max="100"
          step="0.01"
          :aria-label="t('assets.annualRatePercent.label')"
          placeholder="0"
          class="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
        >
      </label>
      <button
        type="submit"
        class="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        {{ t('assetsList.add') }}
      </button>
    </form>

    <ul
      v-if="assets.state.items.length > 0"
      class="flex flex-col gap-2"
      role="list"
    >
      <li
        v-for="a in assets.state.items"
        :key="a.id"
        class="flex items-center justify-between gap-3 rounded border border-slate-200 px-3 py-2 dark:border-slate-700"
      >
        <div class="flex min-w-0 flex-col">
          <span class="truncate font-medium">{{ a.name }}</span>
          <span class="text-xs text-slate-500 dark:text-slate-400">
            {{ t(`assetsList.types.${a.type}`)
            }}<template v-if="a.annualRatePercent > 0">
              · {{ a.annualRatePercent }}% E.A.
            </template>
          </span>
        </div>
        <div class="flex shrink-0 items-center gap-3">
          <span class="text-sm tabular-nums">{{ formatCurrency(a.value, props.currency) }}</span>
          <button
            type="button"
            :aria-label="t('assetsList.delete', { name: a.name })"
            class="rounded border border-red-200 px-2 py-1 text-xs text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
            @click="askDelete(a.id)"
          >
            {{ t('common.delete') }}
          </button>
        </div>
      </li>
    </ul>

    <footer class="border-t border-slate-200 pt-3 text-sm dark:border-slate-700">
      {{ t('assetsList.total', { amount: formatCurrency(total, props.currency) }) }}
    </footer>

    <ConfirmDialog
      v-model:open="confirmOpen"
      :title="t('assetsList.confirmTitle')"
      :message="t('assetsList.confirmMessage')"
      :confirm-label="t('expenses.confirm')"
      :cancel-label="t('expenses.cancel')"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </section>
</template>
