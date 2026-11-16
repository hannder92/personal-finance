import { onMounted, ref } from 'vue'

export type PersistenceStatus = 'unknown' | 'unsupported' | 'persisted' | 'best_effort'

// Wraps the Storage API's persist(): a granted request stops the browser from
// evicting this site's localStorage under storage pressure. It does not stop
// Safari's 7-day inactivity cleanup, nor the user clearing site data.
export function useStoragePersistence() {
  const status = ref<PersistenceStatus>('unknown')

  function api(): StorageManager | null {
    if (typeof navigator === 'undefined') return null
    const storage = navigator.storage
    return storage && typeof storage.persist === 'function' ? storage : null
  }

  async function refresh(): Promise<void> {
    const storage = api()
    if (!storage || typeof storage.persisted !== 'function') {
      status.value = 'unsupported'
      return
    }
    status.value = (await storage.persisted()) ? 'persisted' : 'best_effort'
  }

  async function request(): Promise<void> {
    const storage = api()
    if (!storage) {
      status.value = 'unsupported'
      return
    }
    status.value = (await storage.persist()) ? 'persisted' : 'best_effort'
  }

  onMounted(() => {
    void refresh()
  })

  return { status, request, refresh }
}
