<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PiggyBank } from 'lucide-vue-next'
import CurrencyInput from '@/components/common/CurrencyInput.vue'
import { useFormat } from '@/composables/useFormat'
import { usePrepaymentPlan } from '@/composables/usePrepaymentPlan'
import type { PayoffOrder, PrepaymentMode } from '@/lib/calculations/prepayment'
import { useSettingsStore } from '@/stores/settingsStore'

const { t } = useI18n()
const fmt = useFormat()
const settings = useSettingsStore()

const extraMonthly = ref(0)
const primaAbono = ref(0)
const cesantiasInterestAbono = ref(0)
const mode = ref<PrepaymentMode>('term')

const {
  order,
  setOrder,
  comparison,
  baselineDate,
  planDate,
  rows,
  cuotaNow,
  cuotaInAYear,
  freeForAllocation,
  suggestedPrima,
  suggestedCesantiasInterest,
  hasDebts,
} = usePrepaymentPlan({ extraMonthly, primaAbono, cesantiasInterestAbono, mode })

const ORDERS: PayoffOrder[] = ['avalanche', 'snowball']
const MODES: PrepaymentMode[] = ['term', 'payment']

const planNeverEnds = computed(() => planDate.value === null && comparison.value.plan.months > 0)
const hasSavings = computed(
  () => comparison.value.monthsSaved > 0 || comparison.value.interestSaved > 0
)
const showCuotaChange = computed(
  () => mode.value === 'payment' && cuotaInAYear.value > 0 && cuotaInAYear.value < cuotaNow.value
)
const hasEstimates = computed(
  () => suggestedPrima.value > 0 || suggestedCesantiasInterest.value > 0
)

function dateLabel(date: Date | null): string {
  return date ? fmt.monthYear(date) : t('debts.payoff.simulator.neverShort')
}

function useEstimates() {
  primaAbono.value = Math.round(suggestedPrima.value)
  cesantiasInterestAbono.value = suggestedCesantiasInterest.value
}

const optionClass = (active: boolean) => [
  'flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-lg border px-3 text-center text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500',
  active
    ? 'border-blue-600 bg-blue-50 font-medium text-blue-800 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-200'
    : 'border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300',
]
</script>

<template>
  <section
    data-testid="prepayment-simulator"
    class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
  >
    <header class="flex items-start gap-2">
      <PiggyBank
        class="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400"
        aria-hidden="true"
      />
      <div>
        <h2 class="text-base font-semibold">
          {{ t('debts.payoff.simulator.title') }}
        </h2>
        <p class="text-sm text-slate-600 dark:text-slate-400">
          {{ t('debts.payoff.simulator.context') }}
        </p>
      </div>
    </header>

    <p
      v-if="!hasDebts"
      data-testid="prepayment-empty"
      class="text-sm text-slate-500"
    >
      {{ t('debts.payoff.simulator.empty') }}
    </p>

    <template v-else>
      <div class="grid gap-3 sm:grid-cols-3">
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-xs text-slate-600 dark:text-slate-300">
            {{ t('debts.payoff.simulator.extraLabel') }}
          </span>
          <CurrencyInput
            v-model="extraMonthly"
            :currency="settings.state.currency"
            data-testid="prepayment-extra"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-xs text-slate-600 dark:text-slate-300">
            {{ t('debts.payoff.simulator.primaLabel') }}
          </span>
          <CurrencyInput
            v-model="primaAbono"
            :currency="settings.state.currency"
            data-testid="prepayment-prima"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-xs text-slate-600 dark:text-slate-300">
            {{ t('debts.payoff.simulator.cesantiasLabel') }}
          </span>
          <CurrencyInput
            v-model="cesantiasInterestAbono"
            :currency="settings.state.currency"
            data-testid="prepayment-cesantias"
          />
        </label>
      </div>

      <div class="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-400">
        <p
          v-if="freeForAllocation > 0"
          data-testid="prepayment-free-hint"
        >
          {{ t('debts.payoff.simulator.freeHint', { amount: fmt.currency(freeForAllocation) }) }}
        </p>
        <p v-if="hasEstimates">
          {{
            t('debts.payoff.simulator.estimatesNote', {
              prima: fmt.currency(suggestedPrima),
              cesantias: fmt.currency(suggestedCesantiasInterest),
            })
          }}
          <button
            type="button"
            data-testid="prepayment-use-estimates"
            class="ml-1 min-h-[44px] font-medium text-blue-700 underline dark:text-blue-300"
            @click="useEstimates"
          >
            {{ t('debts.payoff.simulator.useEstimates') }}
          </button>
        </p>
      </div>

      <fieldset class="flex flex-col gap-2">
        <legend class="mb-1 text-xs text-slate-600 dark:text-slate-300">
          {{ t('debts.payoff.simulator.modeLabel') }}
        </legend>
        <div class="flex gap-2">
          <label
            v-for="m in MODES"
            :key="m"
            :class="optionClass(mode === m)"
            :data-testid="`prepayment-mode-${m}`"
          >
            <input
              v-model="mode"
              type="radio"
              name="prepayment-mode"
              :value="m"
              class="sr-only"
            >
            {{
              t(
                m === 'term'
                  ? 'debts.payoff.simulator.modeTerm'
                  : 'debts.payoff.simulator.modePayment'
              )
            }}
          </label>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          {{
            t(
              mode === 'term'
                ? 'debts.payoff.simulator.modeTermHint'
                : 'debts.payoff.simulator.modePaymentHint'
            )
          }}
        </p>
      </fieldset>

      <fieldset class="flex flex-col gap-2">
        <legend class="mb-1 text-xs text-slate-600 dark:text-slate-300">
          {{ t('debts.payoff.strategy.label') }}
        </legend>
        <div class="flex gap-2">
          <label
            v-for="o in ORDERS"
            :key="o"
            :class="optionClass(order === o)"
            :data-testid="`prepayment-order-${o}`"
          >
            <input
              type="radio"
              name="prepayment-order"
              :value="o"
              :checked="order === o"
              class="sr-only"
              @change="setOrder(o)"
            >
            {{ t(`debts.payoff.strategy.${o}`) }}
          </label>
        </div>
      </fieldset>

      <div
        data-testid="prepayment-result"
        class="flex flex-col gap-1 rounded-lg bg-slate-50 p-3 dark:bg-slate-800"
      >
        <p
          v-if="planNeverEnds"
          data-testid="prepayment-never"
          class="text-sm font-medium text-red-700 dark:text-red-300"
        >
          {{ t('debts.payoff.simulator.never') }}
        </p>
        <template v-else>
          <p
            data-testid="prepayment-plan-date"
            class="text-xl font-semibold"
          >
            {{ t('debts.payoff.simulator.heroDate', { date: dateLabel(planDate) }) }}
          </p>
          <p
            data-testid="prepayment-baseline-date"
            class="text-sm text-slate-600 dark:text-slate-400"
          >
            {{ t('debts.payoff.simulator.baselineDate', { date: dateLabel(baselineDate) }) }}
          </p>
          <template v-if="hasSavings">
            <p
              v-if="comparison.monthsSaved > 0"
              data-testid="prepayment-months-saved"
              class="text-sm font-medium text-green-700 dark:text-green-300"
            >
              {{ t('debts.payoff.simulator.monthsSaved', comparison.monthsSaved) }}
            </p>
            <p
              data-testid="prepayment-interest-saved"
              class="text-sm font-medium text-green-700 dark:text-green-300"
            >
              {{
                t('debts.payoff.simulator.interestSaved', {
                  amount: fmt.currency(comparison.interestSaved),
                })
              }}
            </p>
            <p
              v-if="Number.isFinite(comparison.baseline.totalInterest)"
              class="text-xs text-slate-600 dark:text-slate-400"
            >
              {{
                t('debts.payoff.simulator.interestCompare', {
                  plan: fmt.currency(comparison.plan.totalInterest),
                  baseline: fmt.currency(comparison.baseline.totalInterest),
                })
              }}
            </p>
          </template>
          <p
            v-else
            class="text-sm text-slate-600 dark:text-slate-400"
          >
            {{ t('debts.payoff.simulator.noSavings') }}
          </p>
          <p
            v-if="showCuotaChange"
            data-testid="prepayment-cuota-change"
            class="text-sm text-slate-700 dark:text-slate-300"
          >
            {{
              t('debts.payoff.simulator.cuotaChange', {
                now: fmt.currency(cuotaNow),
                later: fmt.currency(cuotaInAYear),
              })
            }}
          </p>
        </template>
      </div>

      <div>
        <h3 class="text-sm font-semibold">
          {{ t('debts.payoff.simulator.orderTitle') }}
        </h3>
        <ol class="mt-2 list-decimal space-y-1 pl-5 text-sm">
          <li
            v-for="row in rows"
            :key="row.id"
            data-testid="prepayment-debt-row"
          >
            {{
              t('debts.payoff.simulator.debtRow', {
                name: row.name,
                plan: dateLabel(row.planDate),
                baseline: dateLabel(row.baselineDate),
              })
            }}
          </li>
        </ol>
      </div>
    </template>
  </section>
</template>
