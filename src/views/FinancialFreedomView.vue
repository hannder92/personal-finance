<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import FlowCoverageBlock from '@/components/fi/FlowCoverageBlock.vue'
import { useAssumptions } from '@/composables/useAssumptions'
import { useFinancialFreedom } from '@/composables/useFinancialFreedom'
import { useFormat } from '@/composables/useFormat'
import { useSavingsFeasibility } from '@/composables/useSavingsFeasibility'
import { useSettingsStore } from '@/stores/settingsStore'

const { t } = useI18n()
const fmtx = useFormat()
const settings = useSettingsStore()
const { feasible } = useSavingsFeasibility()
const { annualReturnPercent, inflationPercent, withdrawalRatePercent } = useAssumptions()
const {
  monthlyLivingExpense,
  liquidAssets,
  targetPatrimony,
  monthsToTarget,
  monthsWithoutReturn,
  targetReached,
  desiredYears,
  requiredMonthlyForDesired,
  currentSavingsSuffices,
} = useFinancialFreedom()

function fmt(n: number): string {
  return fmtx.currency(n)
}

function years(months: number): string {
  return fmtx.number(months / 12, 1)
}

const noExpense = computed(() => monthlyLivingExpense.value <= 0)

// Hero: years (or months below two years) with the estimated month.
const horizonText = computed(() => {
  const months = monthsToTarget.value
  if (months === null) return null
  const now = new Date()
  const date = fmtx.monthYear(new Date(now.getFullYear(), now.getMonth() + months, 1))
  if (months >= 24) return t('fi.detail.horizonYears', { years: years(months), date })
  return t('fi.detail.horizonMonths', { months, date })
})

// The ahorro factible can be 0 or negative; the comparison says "hoy $0" in that case.
const currentMonthly = computed(() => Math.max(0, feasible.value))

const benefit = computed<string | null>(() => {
  if (targetReached.value || annualReturnPercent.value <= 0) return null
  const withReturn = monthsToTarget.value
  const without = monthsWithoutReturn.value
  if (withReturn === null) return null
  if (without === null) {
    return t('fi.detail.benefitUnreachable', {
      when: t('fi.detail.yearsValue', { years: years(withReturn) }),
    })
  }
  if (without <= withReturn) return null
  return t('fi.detail.benefitYears', { years: years(without - withReturn) })
})

const contextLine = computed(() =>
  t('fi.detail.context', {
    ret: fmtx.percent(annualReturnPercent.value, 2),
    inf: fmtx.percent(inflationPercent.value, 2),
    wd: fmtx.percent(withdrawalRatePercent.value, 2),
  })
)

// AC-2.3: the horizon is edited in place; invalid values are ignored by the store guard.
const yearsDraft = ref(String(desiredYears.value))
watch(desiredYears, (v) => {
  if (Number(yearsDraft.value) !== v) yearsDraft.value = String(v)
})
function onYearsInput(raw: string): void {
  yearsDraft.value = raw
  settings.setFiDesiredYears(Number(raw))
}
</script>

<template>
  <section
    data-testid="financial-freedom-view"
    class="mx-auto flex max-w-2xl flex-col gap-4 p-4 sm:gap-6 sm:p-6"
  >
    <header>
      <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {{ t('fi.detail.title') }}
      </h1>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
        {{ t('fi.detail.subtitle') }}
      </p>
    </header>

    <!-- P0: years to get there + required monthly (AC-2.7) -->
    <article
      class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <p class="text-sm text-slate-600 dark:text-slate-400">
        {{ t('fi.detail.heroLabel') }}
      </p>
      <p
        data-testid="fi-horizon"
        class="text-3xl font-bold leading-tight"
        :class="
          !targetReached && !horizonText && !noExpense
            ? 'text-amber-700 dark:text-amber-300'
            : 'text-slate-900 dark:text-slate-100'
        "
      >
        <span v-if="targetReached">{{ t('fi.detail.targetReached') }}</span>
        <span v-else-if="horizonText">{{ horizonText }}</span>
        <span v-else-if="feasible <= 0">{{ t('fi.detail.noFeasibleSavings') }}</span>
        <span v-else>{{ t('fi.detail.unreachable') }}</span>
      </p>
      <p
        data-testid="fi-assumptions"
        class="text-xs text-slate-500 dark:text-slate-400"
      >
        {{ contextLine }}
      </p>

      <div
        v-if="!targetReached && !noExpense"
        class="flex flex-col gap-2 border-t border-slate-200 pt-3 dark:border-slate-700"
      >
        <label class="flex items-center justify-between gap-3 text-sm">
          <span>{{ t('fi.detail.desiredYears') }}</span>
          <input
            :value="yearsDraft"
            data-testid="fi-desired-years"
            type="number"
            inputmode="numeric"
            min="5"
            max="40"
            step="1"
            class="min-h-11 w-20 rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-right dark:border-slate-600"
            @input="onYearsInput(($event.target as HTMLInputElement).value)"
          >
        </label>
        <p
          data-testid="fi-required"
          class="text-sm font-medium"
          :class="
            currentSavingsSuffices
              ? 'text-emerald-700 dark:text-emerald-300'
              : 'text-slate-900 dark:text-slate-100'
          "
        >
          <template v-if="currentSavingsSuffices">
            {{ t('fi.detail.sufficient', { years: desiredYears }) }}
          </template>
          <template v-else>
            {{
              t('fi.detail.required', {
                years: desiredYears,
                amount: fmt(Math.round(requiredMonthlyForDesired)),
                current: fmt(currentMonthly),
              })
            }}
          </template>
        </p>
      </div>
    </article>

    <!-- P1: benefit of investing (AC-2.4) -->
    <p
      v-if="benefit"
      data-testid="fi-benefit"
      class="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
    >
      {{ benefit }}
    </p>
    <p
      v-else-if="annualReturnPercent <= 0 && !targetReached"
      data-testid="fi-invite-return"
      class="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300"
    >
      {{ t('fi.detail.inviteReturn') }}
      <RouterLink
        to="/settings#assumptions"
        class="font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        {{ t('fi.detail.inviteLink') }}
      </RouterLink>
    </p>

    <dl class="grid gap-3 text-sm">
      <div class="flex justify-between gap-2">
        <dt>{{ t('fi.detail.target') }}</dt>
        <dd
          data-testid="fi-target"
          class="font-medium"
        >
          {{ fmt(Math.round(targetPatrimony)) }}
        </dd>
      </div>
      <div class="flex justify-between gap-2">
        <dt>{{ t('fi.detail.livingExpense') }}</dt>
        <dd data-testid="fi-living-expense">
          {{ fmt(monthlyLivingExpense) }}
        </dd>
      </div>
      <div class="flex justify-between gap-2">
        <dt>{{ t('fi.detail.liquidAssets') }}</dt>
        <dd data-testid="fi-liquid-assets">
          {{ fmt(liquidAssets) }}
        </dd>
      </div>
    </dl>

    <p
      data-testid="fi-disclaimer"
      class="text-xs text-slate-500 dark:text-slate-400"
    >
      {{ t('fi.detail.disclaimer') }}
    </p>

    <FlowCoverageBlock />
  </section>
</template>
