<script setup lang="ts">
import { computed, ref } from 'vue'
import DeductionRow from '@/components/income/DeductionRow.vue'
import IncomeStreamRow from '@/components/income/IncomeStreamRow.vue'
import NonSalaryBenefitRow from '@/components/income/NonSalaryBenefitRow.vue'
import PresetButtons from '@/components/income/PresetButtons.vue'
import RetentionEstimator from '@/components/income/RetentionEstimator.vue'
import type { DeductionType, IncomeFrequency } from '@/stores/incomeStore'
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

// --- Deducciones ---
const showDeductionForm = ref(false)
const deductionForm = ref({ label: '', amount: '', type: 'fixed' as DeductionType })

function addDeduction() {
  const label = deductionForm.value.label.trim()
  if (!label) return
  income.addDeduction({
    label,
    amount: Number(deductionForm.value.amount) || 0,
    type: deductionForm.value.type,
  })
  deductionForm.value = { label: '', amount: '', type: 'fixed' }
  showDeductionForm.value = false
}

// --- Otros ingresos ---
const showStreamForm = ref(false)
const streamForm = ref({ label: '', amount: '', frequency: 'monthly' as IncomeFrequency })

function addStream() {
  const label = streamForm.value.label.trim()
  if (!label) return
  income.addStream({
    label,
    amount: Number(streamForm.value.amount) || 0,
    frequency: streamForm.value.frequency,
  })
  streamForm.value = { label: '', amount: '', frequency: 'monthly' }
  showStreamForm.value = false
}

// --- Beneficios extrasalariales ---
const showBenefitForm = ref(false)
const benefitForm = ref({ label: '', amount: '' })

function addBenefit() {
  const label = benefitForm.value.label.trim()
  if (!label) return
  income.addBenefit({ label, amount: Number(benefitForm.value.amount) || 0 })
  benefitForm.value = { label: '', amount: '' }
  showBenefitForm.value = false
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

    <!-- Deducciones -->
    <section class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Deducciones
        </h2>
        <button
          type="button"
          class="text-xs text-blue-600 hover:underline dark:text-blue-400"
          @click="showDeductionForm = !showDeductionForm"
        >
          {{ showDeductionForm ? 'Cancelar' : '+ Agregar' }}
        </button>
      </div>

      <form
        v-if="showDeductionForm"
        class="flex flex-col gap-2 rounded border border-slate-200 p-3 dark:border-slate-700"
        @submit.prevent="addDeduction"
      >
        <div class="grid grid-cols-2 gap-2">
          <label class="flex flex-col gap-1 col-span-2">
            <span class="text-xs text-slate-600 dark:text-slate-300">Nombre *</span>
            <input
              v-model="deductionForm.label"
              type="text"
              placeholder="ej. Salud"
              class="rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
              required
            >
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-xs text-slate-600 dark:text-slate-300">Monto / %</span>
            <input
              v-model="deductionForm.amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              class="rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-xs text-slate-600 dark:text-slate-300">Tipo</span>
            <select
              v-model="deductionForm.type"
              class="rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="fixed">Valor fijo</option>
              <option value="percent">Porcentaje</option>
            </select>
          </label>
        </div>
        <button
          type="submit"
          class="self-start rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
        >
          Guardar
        </button>
      </form>

      <div
        v-if="income.state.deductions.length === 0 && !showDeductionForm"
        class="text-xs text-slate-400"
      >
        Sin deducciones. Usa los presets de Colombia o agrega manualmente.
      </div>

      <div
        v-for="d in income.state.deductions"
        :key="d.id"
        class="flex items-center gap-2"
      >
        <DeductionRow
          :label="d.label"
          :amount="d.amount"
          :type="d.type"
          :gross-salary="income.state.grossSalary"
          :currency="settings.state.currency"
          class="flex-1"
        />
        <button
          type="button"
          aria-label="Eliminar deducción"
          class="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
          @click="income.removeDeduction(d.id)"
        >
          ✕
        </button>
      </div>
    </section>

    <!-- Otros ingresos -->
    <section class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Otros ingresos
        </h2>
        <button
          type="button"
          class="text-xs text-blue-600 hover:underline dark:text-blue-400"
          @click="showStreamForm = !showStreamForm"
        >
          {{ showStreamForm ? 'Cancelar' : '+ Agregar' }}
        </button>
      </div>

      <form
        v-if="showStreamForm"
        class="flex flex-col gap-2 rounded border border-slate-200 p-3 dark:border-slate-700"
        @submit.prevent="addStream"
      >
        <div class="grid grid-cols-2 gap-2">
          <label class="col-span-2 flex flex-col gap-1">
            <span class="text-xs text-slate-600 dark:text-slate-300">Nombre *</span>
            <input
              v-model="streamForm.label"
              type="text"
              placeholder="ej. Freelance"
              class="rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
              required
            >
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-xs text-slate-600 dark:text-slate-300">Monto</span>
            <input
              v-model="streamForm.amount"
              type="number"
              min="0"
              placeholder="0"
              class="rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-xs text-slate-600 dark:text-slate-300">Frecuencia</span>
            <select
              v-model="streamForm.frequency"
              class="rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="monthly">Mensual</option>
              <option value="quarterly">Trimestral</option>
              <option value="semiannual">Semestral</option>
              <option value="annual">Anual</option>
            </select>
          </label>
        </div>
        <button
          type="submit"
          class="self-start rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
        >
          Guardar
        </button>
      </form>

      <div
        v-if="income.state.otherStreams.length === 0 && !showStreamForm"
        class="text-xs text-slate-400"
      >
        Sin ingresos adicionales registrados.
      </div>

      <div
        v-for="s in income.state.otherStreams"
        :key="s.id"
        class="flex items-center gap-2"
      >
        <IncomeStreamRow
          :label="s.label"
          :amount="s.amount"
          :frequency="s.frequency"
          :currency="settings.state.currency"
          class="flex-1"
        />
        <button
          type="button"
          aria-label="Eliminar ingreso"
          class="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
          @click="income.removeStream(s.id)"
        >
          ✕
        </button>
      </div>
    </section>

    <!-- Beneficios extrasalariales -->
    <section class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Beneficios extrasalariales
        </h2>
        <button
          type="button"
          class="text-xs text-blue-600 hover:underline dark:text-blue-400"
          @click="showBenefitForm = !showBenefitForm"
        >
          {{ showBenefitForm ? 'Cancelar' : '+ Agregar' }}
        </button>
      </div>

      <form
        v-if="showBenefitForm"
        class="flex flex-col gap-2 rounded border border-slate-200 p-3 dark:border-slate-700"
        @submit.prevent="addBenefit"
      >
        <div class="grid grid-cols-2 gap-2">
          <label class="col-span-2 flex flex-col gap-1">
            <span class="text-xs text-slate-600 dark:text-slate-300">Nombre *</span>
            <input
              v-model="benefitForm.label"
              type="text"
              placeholder="ej. Bono de conectividad"
              class="rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
              required
            >
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-xs text-slate-600 dark:text-slate-300">Monto mensual</span>
            <input
              v-model="benefitForm.amount"
              type="number"
              min="0"
              placeholder="0"
              class="rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
          </label>
        </div>
        <button
          type="submit"
          class="self-start rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
        >
          Guardar
        </button>
      </form>

      <div
        v-if="income.state.nonSalaryBenefits.length === 0 && !showBenefitForm"
        class="text-xs text-slate-400"
      >
        Sin beneficios extrasalariales registrados.
      </div>

      <div
        v-for="b in income.state.nonSalaryBenefits"
        :key="b.id"
        class="flex items-center gap-2"
      >
        <NonSalaryBenefitRow
          :label="b.label"
          :amount="b.amount"
          :currency="settings.state.currency"
          class="flex-1"
        />
        <button
          type="button"
          aria-label="Eliminar beneficio"
          class="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
          @click="income.removeBenefit(b.id)"
        >
          ✕
        </button>
      </div>
    </section>

    <RetentionEstimator
      v-if="settings.state.currency === 'COP'"
      :gross-salary="income.state.grossSalary"
      :currency="settings.state.currency"
    />
  </section>
</template>
