<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import FixedExpenseList from '@/components/expenses/FixedExpenseList.vue'

const { t } = useI18n()
</script>

<template>
  <section class="mx-auto flex max-w-2xl flex-col gap-6 p-6">
    <header>
      <h1 class="text-xl font-semibold">
        {{ t('expenses.title') }}
      </h1>
    </header>
    <FixedExpenseList />
  </section>
</template>
