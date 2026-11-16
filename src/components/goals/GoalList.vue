<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import GoalCard from './GoalCard.vue'
import { formatCurrency } from '@/lib/currency/format'
import { useSavingsFeasibility } from '@/composables/useSavingsFeasibility'
import { useGoalsStore } from '@/stores/goalsStore'

const props = withDefaults(
  defineProps<{
    savingsBucket?: number
    currency?: string
  }>(),
  { savingsBucket: 0, currency: 'COP' }
)

const goals = useGoalsStore()
const { objective, feasible, effectiveGoalCap } = useSavingsFeasibility()
const totalMonthlyContrib = computed(() =>
  goals.state.items.reduce((acc, g) => acc + g.monthlyContrib, 0)
)
const cap = computed(() =>
  effectiveGoalCap.value > 0 ? effectiveGoalCap.value : props.savingsBucket
)
const overBudget = computed(() => totalMonthlyContrib.value > cap.value)
const showFeasibilityAlert = computed(
  () => overBudget.value && objective.value > 0 && feasible.value >= 0
)

function move(idx: number, dir: -1 | 1): void {
  const next = idx + dir
  if (next < 0 || next >= goals.state.items.length) return
  const order = goals.state.items.map((g) => g.id)
  const [moved] = order.splice(idx, 1)
  if (moved !== undefined) order.splice(next, 0, moved)
  goals.reorder(order)
}

const showForm = ref(false)
const form = ref({ name: '', target: '', saved: '', monthlyContrib: '', targetDate: '' })

function onSubmit() {
  const name = form.value.name.trim()
  if (!name) return
  goals.add({
    name,
    target: Number(form.value.target) || 0,
    saved: Number(form.value.saved) || 0,
    monthlyContrib: Number(form.value.monthlyContrib) || 0,
    targetDate: form.value.targetDate || null,
  })
  form.value = { name: '', target: '', saved: '', monthlyContrib: '', targetDate: '' }
  showForm.value = false
}

function removeGoal(id: string) {
  goals.remove(id)
}

const { t } = useI18n()
</script>

<template>
  <section class="flex flex-col gap-3">
    <div class="flex justify-end">
      <button
        type="button"
        class="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
        @click="showForm = !showForm"
      >
        {{ showForm ? t('forms.cancel') : t('goalsView.new') }}
      </button>
    </div>

    <form
      v-if="showForm"
      class="flex flex-col gap-3 rounded border border-slate-200 p-4 dark:border-slate-700"
      @submit.prevent="onSubmit"
    >
      <label class="flex flex-col gap-1">
        <span class="text-xs text-slate-600 dark:text-slate-300">{{ t('goalsView.name') }}</span>
        <input
          v-model="form.name"
          type="text"
          placeholder="ej. Fondo de emergencia"
          class="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          required
        >
      </label>

      <div class="grid grid-cols-2 gap-3">
        <label class="flex flex-col gap-1">
          <span class="text-xs text-slate-600 dark:text-slate-300">{{
            t('goalsView.target')
          }}</span>
          <input
            v-model="form.target"
            type="number"
            min="0"
            placeholder="0"
            class="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-xs text-slate-600 dark:text-slate-300">{{ t('goalsView.saved') }}</span>
          <input
            v-model="form.saved"
            type="number"
            min="0"
            placeholder="0"
            class="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-xs text-slate-600 dark:text-slate-300">{{
            t('goalsView.monthly')
          }}</span>
          <input
            v-model="form.monthlyContrib"
            type="number"
            min="0"
            placeholder="0"
            class="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-xs text-slate-600 dark:text-slate-300">{{ t('goalsView.date') }}</span>
          <input
            v-model="form.targetDate"
            type="date"
            class="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
        </label>
      </div>

      <button
        type="submit"
        class="self-start rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {{ t('forms.save') }}
      </button>
    </form>

    <p
      data-testid="goals-rule-cap"
      class="text-sm text-slate-600 dark:text-slate-400"
    >
      {{ t('goalsView.ruleCap', { amount: formatCurrency(objective, currency) }) }}
    </p>
    <p
      data-testid="goals-feasible-cap"
      class="text-sm text-slate-600 dark:text-slate-400"
    >
      {{ t('goalsView.feasibleCap', { amount: formatCurrency(feasible, currency) }) }}
    </p>

    <div
      v-if="showFeasibilityAlert"
      data-testid="goals-feasibility-alert"
      role="alert"
      class="rounded border-l-4 border-l-amber-500 bg-amber-50 px-3 py-2 text-sm dark:bg-amber-950"
    >
      {{
        t('goalsView.overFeasible', {
          total: formatCurrency(totalMonthlyContrib, currency),
          rule: formatCurrency(objective, currency),
          feasible: formatCurrency(feasible, currency),
        })
      }}
    </div>

    <div
      v-else-if="overBudget"
      role="alert"
      class="rounded border-l-4 border-l-amber-500 bg-amber-50 px-3 py-2 text-sm dark:bg-amber-950"
    >
      {{
        t('goalsView.overBudget', {
          total: formatCurrency(totalMonthlyContrib, currency),
          budget: formatCurrency(savingsBucket, currency),
        })
      }}
    </div>

    <div
      v-if="goals.state.items.length === 0 && !showForm"
      class="rounded border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500 dark:border-slate-700"
    >
      {{ t('goalsView.empty') }}
    </div>

    <div
      v-for="(g, idx) in goals.state.items"
      :key="g.id"
      class="flex items-stretch gap-2"
    >
      <GoalCard
        :goal="g"
        :currency="currency"
        class="flex-1"
      />
      <div class="flex flex-col gap-1">
        <button
          type="button"
          :aria-label="t('goalsView.up')"
          class="rounded border px-2 py-1 text-xs"
          @click="move(idx, -1)"
        >
          ↑
        </button>
        <button
          type="button"
          :aria-label="t('goalsView.down')"
          class="rounded border px-2 py-1 text-xs"
          @click="move(idx, 1)"
        >
          ↓
        </button>
        <button
          type="button"
          :aria-label="t('goalsView.delete')"
          class="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          @click="removeGoal(g.id)"
        >
          ✕
        </button>
      </div>
    </div>
  </section>
</template>
