<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import StepIndicator from './StepIndicator.vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { useIncomeStore } from '@/stores/incomeStore'

const router = useRouter()
const settings = useSettingsStore()
const income = useIncomeStore()

const step = computed(() => settings.state.onboarding.currentStep)
const total = computed(() => settings.state.onboarding.totalSteps)
const displayStep = computed(() => step.value + 1)

// Local form refs prefilled from store.
const grossSalary = ref<number>(income.state.grossSalary)
watch(
  () => income.state.grossSalary,
  (v) => {
    grossSalary.value = v
  }
)

function onNext() {
  if (step.value >= total.value - 1) return
  settings.bumpOnboardingStep(1)
}

function onSkip() {
  settings.setOnboardingDone(true)
  router.push('/')
}

function onFinish() {
  settings.setOnboardingDone(true)
  router.push('/')
}

function onGrossInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value.replace(/\D/g, '')
  const parsed = raw === '' ? 0 : Number.parseInt(raw, 10)
  grossSalary.value = parsed
  income.setGrossSalary(parsed)
}

const isLast = computed(() => step.value >= total.value - 1)
</script>

<template>
  <section class="mx-auto flex max-w-md flex-col gap-6 p-6">
    <StepIndicator
      :current="displayStep"
      :total="total"
    />

    <div v-if="step === 0">
      <h1 class="mb-3 text-lg font-semibold">
        Tu ingreso (salario bruto)
      </h1>
      <label class="flex flex-col gap-1">
        <span class="text-sm text-slate-600 dark:text-slate-300">Salario bruto mensual</span>
        <input
          type="text"
          inputmode="numeric"
          :value="grossSalary === 0 ? '' : new Intl.NumberFormat('es-CO').format(grossSalary)"
          class="rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          aria-label="Salario bruto"
          @input="onGrossInput"
        >
      </label>
    </div>

    <div v-else-if="step === 1">
      <h1 class="mb-3 text-lg font-semibold">
        Tus gastos fijos
      </h1>
      <p class="mb-3 text-sm text-slate-600 dark:text-slate-300">
        Podrás agregarlos en detalle al terminar.
      </p>
      <label class="flex flex-col gap-1">
        <span class="text-sm text-slate-600 dark:text-slate-300">Salario bruto (paso anterior)</span>
        <input
          type="text"
          readonly
          :value="grossSalary === 0 ? '' : new Intl.NumberFormat('es-CO').format(grossSalary)"
          class="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 dark:border-slate-700 dark:bg-slate-800"
          aria-label="Salario bruto"
        >
      </label>
    </div>

    <div v-else>
      <h1 class="mb-3 text-lg font-semibold">
        Tus deudas
      </h1>
      <p class="mb-3 text-sm text-slate-600 dark:text-slate-300">
        Podrás agregarlas en detalle al terminar.
      </p>
      <label class="flex flex-col gap-1">
        <span class="text-sm text-slate-600 dark:text-slate-300">Salario bruto</span>
        <input
          type="text"
          readonly
          :value="grossSalary === 0 ? '' : new Intl.NumberFormat('es-CO').format(grossSalary)"
          class="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 dark:border-slate-700 dark:bg-slate-800"
          aria-label="Salario bruto"
        >
      </label>
    </div>

    <div class="mt-4 flex items-center justify-between gap-3">
      <button
        type="button"
        class="text-sm text-slate-600 underline-offset-2 hover:underline dark:text-slate-300"
        @click="onSkip"
      >
        Saltar
      </button>

      <button
        v-if="!isLast"
        type="button"
        class="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        @click="onNext"
      >
        Siguiente
      </button>

      <button
        v-else
        type="button"
        class="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        @click="onFinish"
      >
        Finalizar
      </button>
    </div>
  </section>
</template>
