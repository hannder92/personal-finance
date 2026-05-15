<script setup lang="ts">
import { computed } from 'vue'
import AssetList from '@/components/networth/AssetList.vue'
import NetWorthBanner from '@/components/networth/NetWorthBanner.vue'
import { useAssetsStore } from '@/stores/assetsStore'
import { useCardsStore } from '@/stores/cardsStore'
import { useSettingsStore } from '@/stores/settingsStore'

const settings = useSettingsStore()
const assets = useAssetsStore()
const cards = useCardsStore()

const totalAssets = computed(() => assets.state.items.reduce((acc, a) => acc + a.value, 0))
const totalLiabilities = computed(() => cards.state.items.reduce((acc, c) => acc + c.balance, 0))
</script>

<template>
  <section class="mx-auto flex max-w-2xl flex-col gap-6 p-6">
    <header>
      <h1 class="text-xl font-semibold">
        Patrimonio
      </h1>
    </header>

    <NetWorthBanner
      :total-assets="totalAssets"
      :total-liabilities="totalLiabilities"
      :currency="settings.state.currency"
    />

    <AssetList :currency="settings.state.currency" />
  </section>
</template>
