<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '@/lib/currency/format'
import type { Snapshot } from '@/stores/snapshotsStore'

const props = withDefaults(
  defineProps<{
    snapshots?: Snapshot[]
    currency?: string
  }>(),
  { snapshots: () => [], currency: 'COP' }
)

const ordered = computed(() => [...props.snapshots].sort((a, b) => b.month.localeCompare(a.month)))
</script>

<template>
  <div>
    <ul
      v-if="ordered.length > 0"
      class="flex flex-col gap-2"
      role="list"
    >
      <li
        v-for="s in ordered"
        :key="s.id"
        :data-month="s.month"
        class="flex items-center justify-between rounded border border-slate-200 px-3 py-2 dark:border-slate-700"
      >
        <div class="flex flex-col">
          <span class="text-sm font-semibold">{{ s.month }}</span>
          <span class="text-xs text-slate-500">Score {{ s.healthScore }}</span>
        </div>
        <span class="text-sm">{{ formatCurrency(s.netIncome, currency) }}</span>
      </li>
    </ul>
    <p
      v-else
      class="rounded border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500"
    >
      Sin snapshots todavía. El primer cierre se guardará al inicio del próximo mes.
    </p>
  </div>
</template>
