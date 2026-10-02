<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SemanticBadge from '@/components/common/SemanticBadge.vue'
import { formatCurrency } from '@/lib/currency/format'
import { formatMonthYear } from '@/lib/format/locale'
import { useGoalStatus } from '@/composables/useGoalStatus'
import { useGoalsStore, type Goal } from '@/stores/goalsStore'

const props = withDefaults(
  defineProps<{
    goal?: Goal
    currency?: string
  }>(),
  { currency: 'COP' }
)

const { t, locale } = useI18n()
const goals = useGoalsStore()
const {
  eta,
  targetDate,
  monthsToTargetDate,
  requiredMonthly,
  completed,
  status,
  inflatedTarget,
  investBenefit,
} = useGoalStatus(() => props.goal)

const progressPct = computed(() => {
  if (!props.goal || props.goal.target <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((props.goal.saved / props.goal.target) * 100)))
})

const etaMonths = computed(() => eta.value?.months ?? 0)

function money(n: number): string {
  return formatCurrency(Math.round(n), props.currency)
}

function monthYear(date: Date): string {
  return formatMonthYear(date, locale.value)
}

const badge = computed<{ status: 'success' | 'warning' | 'danger'; label: string } | null>(() => {
  switch (status.value) {
    case 'completed':
      return { status: 'success', label: t('goals.card.completed') }
    case 'onTrack':
      return { status: 'success', label: t('goals.card.onTrack') }
    case 'behind':
      return { status: 'warning', label: t('goals.card.behindBadge') }
    case 'overdue':
      return { status: 'danger', label: t('goals.card.overdueBadge') }
    default:
      return null
  }
})

// One status line at most: overdue > catch-up > arrival margin > no contribution.
const statusLine = computed<{ text: string; tone: 'ok' | 'warn' } | null>(() => {
  const g = props.goal
  if (!g || completed.value || !eta.value) return null
  if (status.value === 'overdue') return { text: t('goals.card.overdue'), tone: 'warn' }
  if (status.value === 'behind' && requiredMonthly.value !== null) {
    return {
      text: t('goals.card.catchUp', {
        amount: money(requiredMonthly.value),
        current: money(g.monthlyContrib),
      }),
      tone: 'warn',
    }
  }
  if (status.value === 'onTrack' && monthsToTargetDate.value !== null) {
    const margin = monthsToTargetDate.value - etaMonths.value
    return margin > 0
      ? { text: t('goals.card.earlier', { count: margin }), tone: 'ok' }
      : { text: t('goals.card.onTime'), tone: 'ok' }
  }
  if (status.value === 'noContrib') return { text: t('goals.card.noContrib'), tone: 'warn' }
  return null
})

const benefitText = computed<string | null>(() => {
  const b = investBenefit.value
  if (!b) return null
  if (b.monthsEarlier === null) return t('goals.card.benefitUnreachable')
  if (b.monthsEarlier <= 0) return null
  if (b.monthlyLess !== null && b.monthlyLess > 0) {
    return t('goals.card.benefit', { months: b.monthsEarlier, amount: money(b.monthlyLess) })
  }
  return t('goals.card.benefitMonths', { months: b.monthsEarlier })
})

function toggleInvested(event: Event): void {
  if (!props.goal) return
  goals.update(props.goal.id, { invested: (event.target as HTMLInputElement).checked })
}
</script>

<template>
  <article
    v-if="goal"
    class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
  >
    <header class="flex items-start justify-between gap-2">
      <h3 class="text-sm font-medium text-slate-700 dark:text-slate-300">
        {{ goal.name }}
      </h3>
      <span data-testid="goal-status">
        <SemanticBadge
          v-if="badge"
          :status="badge.status"
          :label="badge.label"
        />
      </span>
    </header>

    <div>
      <p
        data-testid="goal-target"
        class="text-2xl font-bold text-slate-900 dark:text-slate-100"
      >
        {{ money(goal.target) }}
      </p>
      <p
        v-if="inflatedTarget"
        data-testid="goal-equivalent"
        class="text-xs text-slate-500 dark:text-slate-400"
      >
        {{
          t('goals.card.equivalent', {
            amount: money(inflatedTarget.amount),
            date: monthYear(inflatedTarget.date),
          })
        }}
      </p>
    </div>

    <!-- P0 rows (AC-3.7): estimated date + required contribution -->
    <dl
      v-if="!completed"
      class="grid gap-1 text-sm"
    >
      <div
        v-if="eta?.estimatedDate"
        data-testid="goal-estimated"
        class="text-slate-800 dark:text-slate-200"
      >
        {{ t('goals.card.estimated', { date: monthYear(eta.estimatedDate) }) }}
      </div>
      <div
        v-if="requiredMonthly !== null"
        data-testid="goal-required"
        class="font-medium text-slate-900 dark:text-slate-100"
      >
        {{ t('goals.card.required', { amount: money(requiredMonthly) }) }}
      </div>
    </dl>

    <div
      role="progressbar"
      :aria-valuenow="progressPct"
      :aria-valuemin="0"
      :aria-valuemax="100"
      class="h-2 w-full overflow-hidden rounded bg-slate-200 dark:bg-slate-700"
    >
      <div
        class="h-full bg-emerald-600"
        :style="{ width: `${progressPct}%` }"
      />
    </div>

    <div class="flex justify-between text-xs text-slate-600 dark:text-slate-300">
      <span>{{ formatCurrency(goal.saved, currency) }} /
        {{ formatCurrency(goal.target, currency) }}</span>
      <span v-if="!completed && etaMonths !== Infinity">{{
        t('goals.card.months', { count: etaMonths })
      }}</span>
    </div>

    <p
      v-if="targetDate && !completed"
      data-testid="goal-target-date"
      class="text-xs text-slate-500 dark:text-slate-400"
    >
      {{ t('goals.card.targetDate', { date: monthYear(targetDate) }) }}
    </p>
    <p
      v-if="statusLine"
      data-testid="goal-warning"
      class="text-xs font-medium"
      :class="
        statusLine.tone === 'warn'
          ? 'text-amber-700 dark:text-amber-300'
          : 'text-emerald-700 dark:text-emerald-300'
      "
    >
      {{ statusLine.text }}
    </p>
    <p
      v-if="benefitText"
      data-testid="goal-benefit"
      class="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
    >
      {{ benefitText }}
    </p>

    <label
      v-if="!completed"
      class="flex min-h-11 cursor-pointer items-center gap-3 border-t border-slate-200 pt-2 text-sm dark:border-slate-700"
    >
      <input
        type="checkbox"
        role="switch"
        data-testid="goal-invested-toggle"
        :checked="goal.invested"
        class="h-5 w-5 accent-emerald-600"
        @change="toggleInvested"
      >
      <span class="flex flex-col">
        <span>{{ t('goals.card.invested') }}</span>
        <span class="text-xs text-slate-500 dark:text-slate-400">{{
          t('goals.card.investedHelp')
        }}</span>
      </span>
    </label>
  </article>
</template>
