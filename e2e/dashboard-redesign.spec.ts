// T-015 — Feature: 20260609-dashboard-fintech-redesign · TC-E-001 … TC-E-005
import { expect, test } from './fixtures'

test.describe('Dashboard redesign — mobile fold (390×844)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('TC-E-001 (AC-6.1): greeting + day coverage + hero amount visible without scroll', async ({
    returningPage: page,
  }) => {
    await page.goto('/')
    for (const id of ['dashboard-greeting', 'data-day-overview', 'hero-available']) {
      const el = page.getByTestId(id)
      await expect(el).toBeVisible()
      const box = await el.boundingBox()
      expect(box, `${id} has no bounding box`).not.toBeNull()
      expect(box!.y + box!.height, `${id} below the fold`).toBeLessThanOrEqual(844)
    }
  })

  test('TC-E-004 (AC-6.4): new interactive controls have ≥44px tap area', async ({
    returningPage: page,
  }) => {
    await page.goto('/')
    const cards = ['networth-have', 'networth-owe', 'networth-net']
    for (const id of cards) {
      const link = page.getByTestId(id)
      if (await link.isVisible()) {
        const box = await link.boundingBox()
        expect(box!.height, `${id} tap height`).toBeGreaterThanOrEqual(44)
      }
    }
    const viewAll = page.getByTestId('activity-view-all')
    const cta = page.getByTestId('activity-empty-cta')
    const target = (await viewAll.isVisible()) ? viewAll : cta
    const box = await target.boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })

  test('TC-E-003 (AC-6.3): tier-2 rules preserved with new sections outside it', async ({
    returningPage: page,
  }) => {
    await page.goto('/')
    await expect(page.getByTestId('dashboard-tier-2')).not.toBeVisible()
    await page.getByTestId('dashboard-tier2-toggle').click()
    await expect(page.getByTestId('dashboard-tier-2')).toBeVisible()
    // New sections are NOT inside the collapsible container
    const inside = await page
      .getByTestId('dashboard-tier-2')
      .locator('[data-testid="networth-cards"], [data-testid="dashboard-flow-grid"]')
      .count()
    expect(inside).toBe(0)
  })
})

test.describe('Dashboard redesign — desktop (1280×720)', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('TC-E-002 (AC-6.2): flow and activity side by side; analytics always visible', async ({
    returningPage: page,
  }) => {
    await page.goto('/')
    const grid = page.getByTestId('dashboard-flow-grid')
    await expect(grid).toBeVisible()
    const flow = await page.getByTestId('dashboard-flow-section').boundingBox()
    const activity = await page.getByTestId('dashboard-activity-section').boundingBox()
    expect(flow).not.toBeNull()
    expect(activity).not.toBeNull()
    // Side by side: same row (overlapping vertical range), different x
    expect(Math.abs(flow!.y - activity!.y)).toBeLessThan(50)
    expect(activity!.x).toBeGreaterThan(flow!.x + flow!.width - 1)
    await expect(page.getByTestId('dashboard-tier-2')).toBeVisible()
    await expect(page.getByTestId('dashboard-tier2-toggle')).not.toBeVisible()
  })
})

test.describe('Dashboard redesign — greeting persistence', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('TC-E-005 (AC-1.2, AC-1.3): configure name → reload → greeting includes it', async ({
    returningPage: page,
  }) => {
    await page.clock.setFixedTime(new Date('2026-06-09T08:00:00'))
    await page.goto('/settings')
    await page.getByTestId('settings-username-input').fill('Johann')
    await page.getByTestId('settings-username-input').blur()
    await page.goto('/')
    await expect(page.getByTestId('dashboard-greeting')).toContainText('Buenos días, Johann')
    await page.reload()
    await expect(page.getByTestId('dashboard-greeting')).toContainText('Buenos días, Johann')
  })
})
