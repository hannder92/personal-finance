export type NavGroupId = 'home' | 'money' | 'plan' | 'more'

export interface NavItem {
  id: string
  routeName: string
  path: string
  icon: string
  i18nKey: string
}

export interface NavGroup {
  id: NavGroupId
  i18nKey: string
  icon: string
  directLink?: boolean
  children: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'home',
    i18nKey: 'nav.groups.home',
    icon: 'home',
    directLink: true,
    children: [
      {
        id: 'dashboard',
        routeName: 'dashboard',
        path: '/',
        icon: 'home',
        i18nKey: 'nav.dashboard',
      },
    ],
  },
  {
    id: 'money',
    i18nKey: 'nav.groups.money',
    icon: 'wallet',
    children: [
      {
        id: 'income',
        routeName: 'income',
        path: '/income',
        icon: 'banknote',
        i18nKey: 'nav.income',
      },
      {
        id: 'expenses',
        routeName: 'expenses',
        path: '/expenses',
        icon: 'receipt',
        i18nKey: 'nav.expenses',
      },
      {
        id: 'variable',
        routeName: 'variable',
        path: '/variable',
        icon: 'shopping-cart',
        i18nKey: 'nav.variable',
      },
      {
        id: 'allocation',
        routeName: 'allocation',
        path: '/allocation',
        icon: 'pie-chart',
        i18nKey: 'nav.allocation',
      },
    ],
  },
  {
    id: 'plan',
    i18nKey: 'nav.groups.plan',
    icon: 'target',
    children: [
      {
        id: 'debts',
        routeName: 'debts',
        path: '/debts',
        icon: 'credit-card',
        i18nKey: 'nav.debts',
      },
      { id: 'goals', routeName: 'goals', path: '/goals', icon: 'flag', i18nKey: 'nav.goals' },
      {
        id: 'financialFreedom',
        routeName: 'financialFreedom',
        path: '/financial-freedom',
        icon: 'trending-up',
        i18nKey: 'nav.financialFreedom',
      },
    ],
  },
  {
    id: 'more',
    i18nKey: 'nav.groups.more',
    icon: 'more-horizontal',
    children: [
      {
        id: 'networth',
        routeName: 'networth',
        path: '/networth',
        icon: 'landmark',
        i18nKey: 'nav.networth',
      },
      {
        id: 'history',
        routeName: 'history',
        path: '/history',
        icon: 'history',
        i18nKey: 'nav.history',
      },
      {
        id: 'settings',
        routeName: 'settings',
        path: '/settings',
        icon: 'settings',
        i18nKey: 'nav.settings',
      },
    ],
  },
]

export const ROUTE_NAMES = [
  'dashboard',
  'income',
  'expenses',
  'debts',
  'goals',
  'financialFreedom',
  'variable',
  'networth',
  'allocation',
  'history',
  'settings',
] as const

export function findNavByRouteName(routeName: string | symbol | null | undefined): {
  group: NavGroup
  item: NavItem
} | null {
  if (typeof routeName !== 'string') return null
  for (const group of NAV_GROUPS) {
    for (const item of group.children) {
      if (item.routeName === routeName) return { group, item }
    }
  }
  return null
}
