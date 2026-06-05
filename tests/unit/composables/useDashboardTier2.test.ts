import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDashboardTier2 } from '@/composables/useDashboardTier2'
import { DASHBOARD_TIER2_SESSION_KEY } from '@/lib/dashboard-tier2-storage'
import { useIncomeStore } from '@/stores/incomeStore'
import { mockIsDesktop } from '../../helpers/mockMediaQuery'

vi.mock('@vueuse/core', () => ({
  useMediaQuery: () => mockIsDesktop,
}))

function mockSessionStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear() {
      map.clear()
    },
    getItem(key: string) {
      return map.get(key) ?? null
    },
    key(index: number) {
      return [...map.keys()][index] ?? null
    },
    removeItem(key: string) {
      map.delete(key)
    },
    setItem(key: string, value: string) {
      map.set(key, value)
    },
  }
}

describe('useDashboardTier2 (20260604-dashboard-progressive-disclosure)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockIsDesktop.value = false
    vi.stubGlobal('sessionStorage', mockSessionStorage())
  })

  it('TC-U-023 (AC-3.2): new session starts collapsed on mobile', () => {
    const income = useIncomeStore()
    income.state.grossSalary = 5_000_000

    const { tier2Visible, isExpanded } = useDashboardTier2()
    expect(isExpanded.value).toBe(false)
    expect(tier2Visible.value).toBe(false)
  })

  it('TC-U-022 (AC-3.1): toggle writes session and expands tier 2', () => {
    const income = useIncomeStore()
    income.state.grossSalary = 5_000_000

    const { toggle, tier2Visible, isExpanded } = useDashboardTier2()
    toggle()
    expect(isExpanded.value).toBe(true)
    expect(tier2Visible.value).toBe(true)
    expect(sessionStorage.getItem(DASHBOARD_TIER2_SESSION_KEY)).toBe('true')
  })
})
