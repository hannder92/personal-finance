import { beforeEach, describe, expect, it } from 'vitest'
import { migrate, migrations } from '@/lib/storage/migrate'
import { loadAppState, saveAppState } from '@/lib/storage/useAppStorage'
import { AppStateSchemaV5, AppStateSchemaV6, AppStateSchemaV7 } from '@/lib/storage/schema'
import { STORAGE_KEY } from '@/lib/storage/keys'

function v5Payload() {
  return {
    schemaVersion: 5,
    settings: {
      lang: 'es',
      currency: 'COP',
      theme: 'system',
      payoffMethod: 'avalanche',
      onboarding: { done: true, currentStep: 0 },
      lastMonthSeen: '2026-09',
      projectionAnnualRatePercent: 0,
      deductRetencion: true,
      userName: '',
    },
    income: { grossSalary: 8_000_000, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
    expenses: [],
    cards: [
      {
        id: '11111111-1111-4111-8111-111111111111',
        type: 'loan',
        name: 'Crédito',
        balance: 30_000_000,
        apr: 18,
        minPayment: 1_000_000,
        remainingInstallments: 40,
        installments: [],
      },
      {
        id: '22222222-2222-4222-8222-222222222222',
        type: 'card',
        name: 'Visa',
        balance: 2_000_000,
        limit: 5_000_000,
        apr: 28,
        minPayment: 150_000,
        dueDate: null,
        installments: [],
      },
    ],
    goals: [],
    assets: [],
    variableExpenses: [],
    allocation: { needs: 50, wants: 30, savings: 20 },
    snapshots: [],
  }
}

describe('migrate V5 → V6 (libranza flag)', () => {
  it('adds payrollDeducted=false to loans only and bumps the version', () => {
    const out = migrations[6]!(v5Payload()) as ReturnType<typeof v5Payload> & {
      cards: Array<{ type: string; payrollDeducted?: boolean }>
    }
    expect(out.schemaVersion).toBe(6)
    expect(out.cards[0]!.payrollDeducted).toBe(false)
    expect('payrollDeducted' in out.cards[1]!).toBe(false)
    expect(AppStateSchemaV6.safeParse(out).success).toBe(true)
  })

  it('is idempotent and keeps an existing flag', () => {
    const flagged = migrate(v5Payload()) as { cards: Array<Record<string, unknown>> }
    flagged.cards[0]!.payrollDeducted = true
    const again = migrate(flagged) as { cards: Array<Record<string, unknown>> }
    expect(again.cards[0]!.payrollDeducted).toBe(true)
  })

  it('V5 schema rejects a V6 payload (rollback safety)', () => {
    const v6 = migrate(v5Payload())
    expect(AppStateSchemaV5.safeParse(v6).success).toBe(false)
  })
})

describe('storage boundary V6', () => {
  beforeEach(() => localStorage.clear())

  it('loadAppState migrates a stored V5 payload', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v5Payload()))
    const { state, migrated, parseError } = loadAppState()
    expect(parseError).toBeNull()
    expect(migrated).toBe(true)
    expect(state?.schemaVersion).toBe(7)
    const loan = state?.cards.find((c) => c.type === 'loan')
    expect(loan && loan.type === 'loan' ? loan.payrollDeducted : undefined).toBe(false)
  })

  it('round-trips a libranza flag', () => {
    const v7 = AppStateSchemaV7.parse(migrate(v5Payload()))
    const loan = v7.cards[0]!
    if (loan.type === 'loan') loan.payrollDeducted = true
    expect(saveAppState(v7)).toEqual({ ok: true })
    const { state } = loadAppState()
    const reloaded = state?.cards[0]
    expect(reloaded?.type === 'loan' && reloaded.payrollDeducted).toBe(true)
  })
})
