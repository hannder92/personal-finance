import { computed, type ComputedRef } from 'vue'
import { useRoute } from 'vue-router'
import { findNavByRouteName, type NavGroupId } from '@/lib/navigation/nav-config'

export interface UseNavActive {
  activeGroupId: ComputedRef<NavGroupId | null>
  activeItemId: ComputedRef<string | null>
}

export function useNavActive(): UseNavActive {
  const route = useRoute()

  const match = computed(() => findNavByRouteName(route.name))

  const activeGroupId = computed(() => match.value?.group.id ?? null)
  const activeItemId = computed(() => match.value?.item.id ?? null)

  return { activeGroupId, activeItemId }
}
