<script setup lang="ts">
import { computed } from 'vue'
import DeductionRow from '@/components/income/DeductionRow.vue'
import IncomeStreamRow from '@/components/income/IncomeStreamRow.vue'
import NonSalaryBenefitRow from '@/components/income/NonSalaryBenefitRow.vue'
import PresetButtons from '@/components/income/PresetButtons.vue'
import RetentionEstimator from '@/components/income/RetentionEstimator.vue'
import { useIncomeStore } from '@/stores/incomeStore'
import { useSettingsStore } from '@/stores/settingsStore'

const settings = useSettingsStore()
const income = useIncomeStore()

const grossInputValue = computed(() => {
  return income.state.grossSalary === 0
    ? ''
    : new Intl.NumberFormat('es-CO').format(income.state.grossSalary)
})

function onGrossInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value.replace(/\D/g, '')
  const parsed = raw === '' ? 0 : Number.parseInt(raw, 10)
  income.setGrossSalary(parsed)
}
</script>

<template>
  <section class="mx-auto flex max-w-2xl flex-col gap-6 p-6">
    <header>
      <h1 class="text-xl font-semibold">
        Ingresos
      </h1>
    </header>

    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-600 dark:text-slate-300">Salario bruto mensual</span>
      <input
        type="text"
        inputmode="numeric"
        :value="grossInputValue"
        class="rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
        aria-label="Salario bruto"
        @input="onGrossInput"
      >
    </label>

    <PresetButtons />

    <section
      v-if="income.state.deductions.length > 0"
      class="flex flex-col gap-2"
    >
      <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-200">
        Deducciones
      </h2>
      <DeductionRow
        v-for="d in income.state.deductions"
        :key="d.id"
        :label="d.label"
        :amount="d.amount"
        :type="d.type"
        :gross-salary="income.state.grossSalary"
        :currency="settings.state.currency"
      />
    </section>

    <section
      v-if="income.state.otherStreams.length > 0"
      class="flex flex-col gap-2"
    >
      <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-200">
        Otros ingresos
      </h2>
      <IncomeStreamRow
        v-for="s in income.state.otherStreams"
        :key="s.id"
        :label="s.label"
        :amount="s.amount"
        :frequency="s.frequency"
        :currency="settings.state.currency"
      />
    </section>

    <section
      v-if="income.state.nonSalaryBenefits.length > 0"
      class="flex flex-col gap-2"
    >
      <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-200">
        Beneficios extrasalariales
      </h2>
      <NonSalaryBenefitRow
        v-for="b in income.state.nonSalaryBenefits"
        :key="b.id"
        :label="b.label"
        :amount="b.amount"
        :currency="settings.state.currency"
      />
    </section>

    <RetentionEstimator
      v-if="settings.state.currency === 'COP'"
      :gross-salary="income.state.grossSalary"
      :currency="settings.state.currency"
    />
  </section>
</template>
