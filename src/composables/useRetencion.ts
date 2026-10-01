// Bridge: gross salary → estimated monthly retención (Art. 383 ET) for the current year.

import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { calcRetencion } from '@/lib/tax/colombia/retencion'

export function useRetencion(
  grossSalary: MaybeRefOrGetter<number>,
  now: () => Date = () => new Date()
) {
  const result = computed(() => calcRetencion(toValue(grossSalary), now()))
  const year = computed(() => now().getFullYear())
  return { result, year }
}
