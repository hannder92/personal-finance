/**
 * Planificación integrada — extend in T-015: TC-U-006 (AC-5.6) /financial-freedom route.
 */
import { describe, expect, it } from 'vitest'
import { NAV_GROUPS, ROUTE_NAMES } from '@/lib/navigation/nav-config'
import { router } from '@/router'

describe('nav-config (TC-U-001)', () => {
  it('defines exactly four navigation groups', () => {
    expect(NAV_GROUPS).toHaveLength(4)
    expect(NAV_GROUPS.map((g) => g.id)).toEqual(['home', 'money', 'plan', 'more'])
  })

  it('maps all child route names to router routes', () => {
    const routerNames = new Set(router.getRoutes().map((r) => r.name))
    for (const group of NAV_GROUPS) {
      for (const child of group.children) {
        expect(routerNames.has(child.routeName)).toBe(true)
        expect(ROUTE_NAMES).toContain(child.routeName)
      }
    }
  })

  it('TC-U-006 (AC-5.6): plan group includes financial freedom route', () => {
    const plan = NAV_GROUPS.find((g) => g.id === 'plan')!
    const item = plan.children.find((c) => c.id === 'financialFreedom')
    expect(item).toBeDefined()
    expect(item?.path).toBe('/financial-freedom')
    expect(item?.routeName).toBe('financialFreedom')
    expect(ROUTE_NAMES).toContain('financialFreedom')
    const routerNames = new Set(router.getRoutes().map((r) => r.name))
    expect(routerNames.has('financialFreedom')).toBe(true)
  })

  it('money group has four destinations', () => {
    const money = NAV_GROUPS.find((g) => g.id === 'money')!
    expect(money.children.map((c) => c.routeName)).toEqual([
      'income',
      'expenses',
      'variable',
      'allocation',
    ])
  })
})
