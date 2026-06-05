import { ref } from 'vue'

/** Shared ref for `@vueuse/core` `useMediaQuery` mocks in dashboard tests. */
export const mockIsDesktop = ref(false)

export function setMockDesktop(value: boolean): void {
  mockIsDesktop.value = value
}
