<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import DayAgendaCard from '@/components/dashboard/day/DayAgendaCard.vue'
import DayCoverageCard from '@/components/dashboard/day/DayCoverageCard.vue'
import DayPaymentsCard from '@/components/dashboard/day/DayPaymentsCard.vue'
import { useDayOverview } from '@/composables/useDayOverview'

const { t } = useI18n()
const { coverage, paymentsToday, agenda } = useDayOverview()
</script>

<template>
  <section
    data-testid="data-day-overview"
    class="flex flex-col gap-6"
    :aria-label="t('day.sectionTitle')"
  >
    <h2 class="sr-only">
      {{ t('day.sectionTitle') }}
    </h2>
    <DayCoverageCard :coverage="coverage" />
    <DayPaymentsCard :payments="paymentsToday" />
    <DayAgendaCard :agenda="agenda" />
  </section>
</template>
