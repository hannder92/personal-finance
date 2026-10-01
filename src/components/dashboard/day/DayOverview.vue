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
    class="card flex flex-col divide-y divide-slate-100 dark:divide-slate-800"
    :aria-label="t('day.sectionTitle')"
  >
    <h2 class="sr-only">
      {{ t('day.sectionTitle') }}
    </h2>
    <DayCoverageCard :coverage="coverage" />
    <!-- The coverage line already says "no payments today"; skip the empty list. -->
    <DayPaymentsCard
      v-if="paymentsToday.length > 0"
      :payments="paymentsToday"
    />
    <DayAgendaCard :agenda="agenda" />
  </section>
</template>
