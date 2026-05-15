<script setup lang="ts">
import CardCard from '@/components/debts/CardCard.vue'
import InstallmentList from '@/components/debts/InstallmentList.vue'
import { useCardsStore } from '@/stores/cardsStore'
import { useSettingsStore } from '@/stores/settingsStore'

const cards = useCardsStore()
const settings = useSettingsStore()
</script>

<template>
  <section class="mx-auto flex max-w-2xl flex-col gap-6 p-6">
    <header>
      <h1 class="text-xl font-semibold">
        Deudas
      </h1>
    </header>

    <div class="flex flex-col gap-3">
      <CardCard
        v-for="item in cards.state.items"
        :key="item.id"
        :card="item"
        :currency="settings.state.currency"
      />
    </div>

    <section
      v-for="item in cards.state.items"
      :key="`inst-${item.id}`"
    >
      <h2
        v-if="item.installments && item.installments.length"
        class="mb-2 text-sm font-semibold"
      >
        Cuotas — {{ item.name }}
      </h2>
      <InstallmentList
        :items="item.installments ?? []"
        :currency="settings.state.currency"
      />
    </section>
  </section>
</template>
