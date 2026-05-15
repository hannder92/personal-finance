import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useSettingsStore } from '@/stores/settingsStore'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: () => import('@/views/OnboardingView.vue'),
  },
  { path: '/income', name: 'income', component: () => import('@/views/IncomeView.vue') },
  { path: '/expenses', name: 'expenses', component: () => import('@/views/ExpensesView.vue') },
  { path: '/debts', name: 'debts', component: () => import('@/views/DebtsView.vue') },
  { path: '/goals', name: 'goals', component: () => import('@/views/GoalsView.vue') },
  {
    path: '/variable',
    name: 'variable',
    component: () => import('@/views/VariableExpensesView.vue'),
  },
  { path: '/networth', name: 'networth', component: () => import('@/views/NetWorthView.vue') },
  {
    path: '/allocation',
    name: 'allocation',
    component: () => import('@/views/AllocationView.vue'),
  },
  { path: '/history', name: 'history', component: () => import('@/views/HistoryView.vue') },
  { path: '/settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Onboarding guard (ADR-9): redirect to /onboarding when store.onboarding.done = false,
// unless already heading there (prevents redirect loop).
router.beforeEach((to) => {
  if (to.name === 'onboarding') return true
  const settings = useSettingsStore()
  if (!settings.state.onboarding.done) return { name: 'onboarding' }
  return true
})
