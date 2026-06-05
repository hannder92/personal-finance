<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import ComparisonBadge from '@/components/dashboard/ComparisonBadge.vue'
import HealthScore from '@/components/dashboard/HealthScore.vue'
import { formatCurrency } from '@/lib/currency/format'
import { useHealthScore } from '@/composables/useHealthScore'
import { useNetIncome } from '@/composables/useNetIncome'
import { useIncomeStore } from '@/stores/incomeStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSnapshotsStore } from '@/stores/snapshotsStore'

const { t } = useI18n()
const settings = useSettingsStore()
const income = useIncomeStore()
const snapshots = useSnapshotsStore()
const { freeForAllocation } = useNetIncome()
const { result: healthScoreResult } = useHealthScore()

const hasIncome = computed(() => income.state.grossSalary > 0)

const sortedSnapshots = computed(() =>
  [...snapshots.state.items].sort((a, b) => b.month.localeCompare(a.month))
)
const latestScore = computed(() => healthScoreResult.value.score)
const previousScore = computed(() => sortedSnapshots.value[0]?.healthScore ?? null)

const healthLabel = computed(() => {
  const score = latestScore.value
  if (score >= 70) return t('dashboard.health.labelOk')
  if (score >= 50) return t('dashboard.health.labelWarn')
  return t('dashboard.health.labelDanger')
})

const showAllocationCta = computed(() => hasIncome.value && freeForAllocation.value > 0)
</script>

<template>
  <header
    data-testid="data-dashboard-hero"
    class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/50"
  >
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="min-w-0 flex-1">
        <p class="text-xs font-medium uppercase tracking-wide text-slate-500">
          {{ t('dashboard.hero.availableLabel') }}
        </p>
        <template v-if="hasIncome">
          <p
            data-testid="hero-available"
            class="text-3xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl"
          >
            {{ formatCurrency(freeForAllocation, settings.state.currency) }}
          </p>
        </template>
        <template v-else>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {{ t('dashboard.hero.emptyIncome') }}
          </p>
          <RouterLink
            to="/income"
            class="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            {{ t('dashboard.hero.emptyIncomeCta') }}
          </RouterLink>
        </template>
        <RouterLink
          v-if="showAllocationCta"
          data-testid="cta-allocation"
          to="/allocation"
          class="mt-2 inline-flex rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          {{ t('dashboard.hero.ctaAllocation') }}
        </RouterLink>
      </div>

      <div
        v-if="hasIncome"
        class="shrink-0"
        data-testid="hero-health-score"
      >
        <p class="text-xs text-slate-500">
          {{ t('dashboard.hero.healthLabel') }}
        </p>
        <div class="flex items-center gap-2">
          <HealthScore
            variant="compact"
            :score="latestScore"
            :label="healthLabel"
            :breakdown="healthScoreResult.components"
          />
          <ComparisonBadge
            :current="latestScore"
            :previous="previousScore"
            :label="t('dashboard.hero.vsPrevious')"
          />
        </div>
      </div>
    </div>
  </header>
</template>
