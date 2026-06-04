<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { IncomeClass } from '@/lib/calculations/income-mix'

const model = defineModel<IncomeClass>({ default: 'linear' })

const { t } = useI18n()

const options: IncomeClass[] = ['linear', 'residual', 'passive']
</script>

<template>
  <label class="block text-sm">
    <span class="mb-1 block font-medium">{{ t('income.class.label') }}</span>
    <select
      v-model="model"
      data-testid="income-class-select"
      class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
    >
      <option
        v-for="option in options"
        :key="option"
        :value="option"
      >
        {{ t(`income.class.${option}`) }}
      </option>
    </select>
  </label>
</template>
