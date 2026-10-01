<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { formatCurrency } from '@/lib/currency/format'
import { useNetWorthSummary } from '@/composables/useNetWorthSummary'
import { useSettingsStore } from '@/stores/settingsStore'

const { t } = useI18n()
const settings = useSettingsStore()
const { assetsTotal, liabilitiesTotal, netWorth, hasData } = useNetWorthSummary()

const fmt = (value: number) => formatCurrency(value, settings.state.currency)

// AC-3.3: net is the only signed amount — green when ≥ 0, red when negative.
const netClass = computed(() =>
  netWorth.value < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
)

const cardClass =
  'flex min-h-[44px] flex-col gap-1 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-700'
</script>

<template>
  <section
    data-testid="networth-cards"
    :aria-label="t('dashboard.networth.title')"
  >
    <h2 class="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
      {{ t('dashboard.networth.title') }}
    </h2>

    <div
      v-if="hasData"
      class="grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      <RouterLink to="/networth">
        <article
          data-testid="networth-have"
          :class="cardClass"
        >
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">
            {{ t('dashboard.networth.have') }}
          </p>
          <p
            data-testid="networth-have-amount"
            class="text-xl font-bold tabular-nums text-slate-900 dark:text-slate-50"
          >
            {{ fmt(assetsTotal) }}
          </p>
        </article>
      </RouterLink>

      <RouterLink to="/debts">
        <article
          data-testid="networth-owe"
          :class="cardClass"
        >
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">
            {{ t('dashboard.networth.owe') }}
          </p>
          <p
            data-testid="networth-owe-amount"
            class="text-xl font-bold tabular-nums text-slate-900 dark:text-slate-50"
          >
            {{ fmt(liabilitiesTotal) }}
          </p>
        </article>
      </RouterLink>

      <RouterLink to="/networth">
        <article
          data-testid="networth-net"
          :class="cardClass"
        >
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">
            {{ t('dashboard.networth.net') }}
          </p>
          <p
            data-testid="networth-net-amount"
            class="text-xl font-bold tabular-nums"
            :class="netClass"
          >
            {{ fmt(netWorth) }}
          </p>
        </article>
      </RouterLink>
    </div>

    <div
      v-else
      data-testid="networth-empty"
      class="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400"
    >
      <svg
        class="size-5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
        />
      </svg>
      <span>{{ t('dashboard.networth.empty') }}</span>
    </div>
  </section>
</template>
