<script setup lang="ts">
import { computed } from 'vue'
import GoalCard from './GoalCard.vue'
import { formatCurrency } from '@/lib/currency/format'
import { useGoalsStore } from '@/stores/goalsStore'

const props = withDefaults(
  defineProps<{
    savingsBucket?: number
    currency?: string
  }>(),
  { savingsBucket: 0, currency: 'COP' }
)

const goals = useGoalsStore()
const totalMonthlyContrib = computed(() =>
  goals.state.items.reduce((acc, g) => acc + g.monthlyContrib, 0)
)
const overBudget = computed(() => totalMonthlyContrib.value > props.savingsBucket)

function move(idx: number, dir: -1 | 1): void {
  const next = idx + dir
  if (next < 0 || next >= goals.state.items.length) return
  const order = goals.state.items.map((g) => g.id)
  const [moved] = order.splice(idx, 1)
  if (moved !== undefined) order.splice(next, 0, moved)
  goals.reorder(order)
}
</script>

<template>
  <section class="flex flex-col gap-3">
    <div
      v-if="overBudget"
      role="alert"
      class="rounded border-l-4 border-l-amber-500 bg-amber-50 px-3 py-2 text-sm dark:bg-amber-950"
    >
      El total de aportes mensuales ({{ formatCurrency(totalMonthlyContrib, currency) }}) excede tu
      presupuesto de ahorro ({{ formatCurrency(savingsBucket, currency) }}).
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
          aria-label="Subir"
          class="rounded border px-2 py-1 text-xs"
          @click="move(idx, -1)"
        >
          ↑
        </button>
        <button
          type="button"
          aria-label="Bajar"
          class="rounded border px-2 py-1 text-xs"
          @click="move(idx, 1)"
        >
          ↓
        </button>
      </div>
    </div>
  </section>
</template>
