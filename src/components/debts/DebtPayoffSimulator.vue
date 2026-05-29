<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatCurrency } from '@/lib/currency/format'
import { useDebtPayoffPlan } from '@/composables/useDebtPayoffPlan'
import { useCardsStore } from '@/stores/cardsStore'
import { useSettingsStore } from '@/stores/settingsStore'

const props = defineProps<{ debtId: string }>()

const { t } = useI18n()
const settings = useSettingsStore()
const cards = useCardsStore()
const { simulateExtraPayment } = useDebtPayoffPlan()

const extra = ref('')
const result = ref<{ monthsSaved: number; interestSaved: number } | null>(null)

const debt = () => cards.state.items.find((d) => d.id === props.debtId)

function onSimulate() {
  const amount = Number(extra.value) || 0
  result.value = simulateExtraPayment(props.debtId, amount)
}
</script>

<template>
  <section
    data-testid="debt-payoff-simulator"
    class="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
  >
    <h3 class="text-sm font-semibold">
      {{ t('debts.payoff.simulator.title') }}
    </h3>
    <p
      v-if="debt()?.type !== 'card'"
      class="mt-2 text-xs text-slate-500"
    >
      {{ t('debts.payoff.simulator.cardsOnly') }}
    </p>
    <template v-else>
      <label class="mt-2 flex flex-col gap-1 text-sm">
        <span>{{ t('debts.payoff.simulator.extraLabel') }}</span>
        <input
          v-model="extra"
          type="number"
          min="0"
          class="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
          :aria-label="t('debts.payoff.simulator.extraLabel')"
        >
      </label>
      <button
        type="button"
        class="mt-2 rounded bg-blue-600 px-3 py-1.5 text-sm text-white"
        aria-label="Simular"
        @click="onSimulate"
      >
        Simular
      </button>
      <div
        v-if="result"
        class="mt-3 space-y-1 text-sm"
      >
        <p data-testid="payoff-months-saved">
          {{ t('debts.payoff.simulator.monthsSaved', { count: result.monthsSaved }) }}
        </p>
        <p data-testid="payoff-interest-saved">
          {{
            t('debts.payoff.simulator.interestSaved', {
              amount: formatCurrency(result.interestSaved, settings.state.currency),
            })
          }}
        </p>
      </div>
    </template>
  </section>
</template>
