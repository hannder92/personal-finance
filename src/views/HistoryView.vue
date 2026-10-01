<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import SnapshotList from '@/components/history/SnapshotList.vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSnapshotsStore } from '@/stores/snapshotsStore'

const { t } = useI18n()
const settings = useSettingsStore()
const snapshots = useSnapshotsStore()
</script>

<template>
  <section class="mx-auto flex max-w-2xl flex-col gap-6 p-6">
    <header>
      <h1 class="text-xl font-semibold">
        {{ t('history.title') }}
      </h1>
    </header>
    <SnapshotList :snapshots="snapshots.state.items" :currency="settings.state.currency" />
  </section>
</template>
