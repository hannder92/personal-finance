<script setup lang="ts">
import FixedExpenseList from '@/components/expenses/FixedExpenseList.vue'
</script>

<template>
  <section class="mx-auto flex max-w-2xl flex-col gap-6 p-6">
    <header>
      <h1 class="text-xl font-semibold">
        Gastos fijos
      </h1>
    </header>
    <FixedExpenseList />
  </section>
</template>
