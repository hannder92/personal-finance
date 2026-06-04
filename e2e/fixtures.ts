import type { Locator, Page } from '@playwright/test'
import { test as base } from '@playwright/test'

const STORAGE_KEY = 'finance_app_data'

export interface AppFixtures {
  /** Fresh session: localStorage is empty before the page loads. */
  freshPage: Page
  /** Returning user: localStorage is pre-seeded with a minimal v2 state. */
  returningPage: Page
}

function minimalV2State(overrides: Record<string, unknown> = {}): string {
  const state = {
    schemaVersion: 2,
    settings: {
      lang: 'es',
      currency: 'COP',
      theme: 'system',
      payoffMethod: 'avalanche',
      onboarding: { done: true, currentStep: 0, totalSteps: 3 },
      lastMonthSeen: null,
    },
    income: { grossSalary: 5_000_000, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
    expenses: [],
    cards: [],
    goals: [],
    assets: [],
    variableExpenses: [],
    snapshots: [],
    allocation: { needs: 50, wants: 30, savings: 20 },
    ...overrides,
  }
  return JSON.stringify(state)
}

/** Init script args: seed localStorage only when empty (survives page.reload). */
export function seedStorageOnce(overrides: Record<string, unknown> = {}): {
  key: string
  state: string
} {
  return { key: STORAGE_KEY, state: minimalV2State(overrides) }
}

export const SEED_ONCE_INIT_SCRIPT = (args: { key: string; state: string }) => {
  if (localStorage.getItem(args.key) === null) {
    localStorage.setItem(args.key, args.state)
  }
}

export const test = base.extend<AppFixtures>({
  freshPage: async ({ page }, use) => {
    await page.context().clearCookies()
    await page.context().addInitScript(() => localStorage.clear())
    await use(page)
  },

  returningPage: async ({ page }, use) => {
    await page
      .context()
      .addInitScript(SEED_ONCE_INIT_SCRIPT, { key: STORAGE_KEY, state: minimalV2State() })
    await use(page)
  },
})

export { expect } from '@playwright/test'

export function minimalState(overrides: Record<string, unknown> = {}): string {
  return minimalV2State(overrides)
}

/** Helper: wait for a locator to be visible within a short timeout. */
export async function waitVisible(locator: Locator, ms = 5000) {
  await locator.waitFor({ state: 'visible', timeout: ms })
}
