import { describe, expect, it } from 'vitest'
import { AppStateSchemaV2 } from '@/lib/storage/schema'

describe('E2E fixture Zod validation', () => {
  it('snapshot state passes AppStateSchemaV2 parse', () => {
    const state = {
      schemaVersion: 2 as const,
      settings: {
        lang: 'es' as const,
        currency: 'COP' as const,
        theme: 'system' as const,
        payoffMethod: 'avalanche' as const,
        onboarding: { done: true, currentStep: 0 },
        lastMonthSeen: '2026-04',
      },
      income: { grossSalary: 5_000_000, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
      expenses: [],
      cards: [],
      goals: [],
      assets: [],
      variableExpenses: [],
      snapshots: [
        {
          id: '22222222-2222-4222-8222-222222222222',
          capturedAt: '2026-04-01T00:00:00.000Z',
          month: '2026-04',
          netIncome: 4_500_000,
          totalFixedExpenses: 1_000_000,
          totalVariableSpent: 200_000,
          totalDebt: 500_000,
          dti: 11.1,
          savingsRate: 15,
          netWorth: 5_000_000,
          healthScore: 72,
        },
      ],
      allocation: { needs: 50, wants: 30, savings: 20 },
    }
    const result = AppStateSchemaV2.safeParse(state)
    if (!result.success) {
      console.error('Zod issues:', JSON.stringify(result.error.issues, null, 2))
    }
    expect(result.success).toBe(true)
  })

  it('returningPage minimal state passes parse', () => {
    const state = {
      schemaVersion: 2 as const,
      settings: {
        lang: 'es' as const,
        currency: 'COP' as const,
        theme: 'system' as const,
        payoffMethod: 'avalanche' as const,
        onboarding: { done: true, currentStep: 0 },
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
    }
    const result = AppStateSchemaV2.safeParse(state)
    if (!result.success) {
      console.error('Zod issues:', JSON.stringify(result.error.issues, null, 2))
    }
    expect(result.success).toBe(true)
  })
})
