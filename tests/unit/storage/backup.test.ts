import { describe, expect, it } from 'vitest'
import { parseBackup, serialize } from '@/lib/storage/backup'
import { AppStateSchemaV6, type AppStateV6 } from '@/lib/storage/schema'

function v6State(): AppStateV6 {
  return AppStateSchemaV6.parse({
    schemaVersion: 6,
    settings: {
      lang: 'es',
      currency: 'COP',
      theme: 'dark',
      payoffMethod: 'snowball',
      onboarding: { done: true, currentStep: 0 },
      lastMonthSeen: '2026-10',
      projectionAnnualRatePercent: 7,
      deductRetencion: false,
      userName: 'Ana',
    },
    income: {
      grossSalary: 8_000_000,
      deductions: [],
      otherStreams: [
        {
          id: '33333333-3333-4333-8333-333333333333',
          label: 'Arriendo',
          amount: 1_200_000,
          frequency: 'monthly',
          incomeClass: 'passive',
        },
      ],
      nonSalaryBenefits: [],
    },
    expenses: [],
    cards: [
      {
        id: '11111111-1111-4111-8111-111111111111',
        type: 'loan',
        name: 'Libranza',
        balance: 30_000_000,
        apr: 18,
        minPayment: 1_000_000,
        remainingInstallments: 40,
        installments: [],
        payrollDeducted: true,
      },
    ],
    goals: [],
    assets: [],
    variableExpenses: [],
    snapshots: [],
    allocation: { needs: 60, wants: 20, savings: 20 },
  })
}

describe('lib/storage/backup', () => {
  it('round-trips a full V6 state without losing fields', () => {
    const state = v6State()
    const parsed = parseBackup(serialize(state, new Date('2026-11-16T00:00:00.000Z')))
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.state).toEqual(state)
    expect(parsed.sourceVersion).toBe(6)
    expect(parsed.exportedAt).toBe('2026-11-16T00:00:00.000Z')
  })

  it('serialize labels the envelope with the current schema version', () => {
    const envelope = JSON.parse(serialize(v6State()))
    expect(envelope.appName).toBe('personal-finances')
    expect(envelope.schemaVersion).toBe(6)
    expect(envelope.data.schemaVersion).toBe(6)
  })

  it('legacy "v2" exports carrying the live store shape keep V4+ fields', () => {
    // The old exporter stamped schemaVersion 2 on the live state and hardcoded the
    // allocation; a migration pass would reset incomeClass, userName and the rate.
    const live = v6State()
    const legacy = {
      appName: 'personal-finances',
      schemaVersion: 2,
      exportedAt: '2026-10-01T00:00:00.000Z',
      data: { ...live, schemaVersion: 2 },
    }
    const parsed = parseBackup(JSON.stringify(legacy))
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.state.settings.userName).toBe('Ana')
    expect(parsed.state.settings.projectionAnnualRatePercent).toBe(7)
    expect(parsed.state.income.otherStreams[0]?.incomeClass).toBe('passive')
    expect(parsed.state.cards[0]).toMatchObject({ type: 'loan', payrollDeducted: true })
  })

  it('genuine v2 payloads (numeric dueDate) are migrated to V6', () => {
    const v2 = {
      appName: 'personal-finances',
      schemaVersion: 2,
      exportedAt: '2026-05-15T10:30:00.000Z',
      data: {
        schemaVersion: 2,
        settings: {
          lang: 'es',
          currency: 'COP',
          theme: 'system',
          payoffMethod: 'avalanche',
          onboarding: { done: true, currentStep: 0 },
          lastMonthSeen: null,
        },
        income: { grossSalary: 5_000_000, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
        expenses: [],
        cards: [
          {
            id: '22222222-2222-4222-8222-222222222222',
            type: 'card',
            name: 'Visa',
            balance: 2_000_000,
            limit: 5_000_000,
            apr: 28,
            minPayment: 200_000,
            dueDate: 15,
            installmentsList: [],
          },
        ],
        goals: [],
        assets: [],
        variableExpenses: [],
        snapshots: [],
        allocation: { needs: 50, wants: 30, savings: 20 },
      },
    }
    const parsed = parseBackup(JSON.stringify(v2))
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.state.schemaVersion).toBe(6)
    expect(parsed.state.cards[0]).toMatchObject({ type: 'card', dueDate: null })
  })

  it('rejects invalid JSON and foreign files', () => {
    expect(parseBackup('{nope')).toEqual({ ok: false, error: 'invalid_json' })
    expect(parseBackup(JSON.stringify({ hello: 'world' })).ok).toBe(false)
  })
})
