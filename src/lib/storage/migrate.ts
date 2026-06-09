// v1 → v2 migration per `specs/20260514-project-refactor/2-data-model.md`.
// Uses a versioned chain (ADR-4): each migrations[N] transforms (N-1) → N in isolation.

import type { AppStateV3, AppStateV4 } from './schema'

type V1State = {
  schemaVersion?: number
  lang?: 'es' | 'en'
  currency?: string
  income?: {
    grossSalary?: number
    deductions?: Array<{ id?: string; label: string; amount: number; type: 'fixed' | 'percent' }>
    otherStreams?: Array<{ id?: string; label: string; amount: number }>
  }
  expenses?: Array<{ id?: string; name: string; amount: number; category?: string; notes?: string }>
  cards?: Array<{
    id?: string
    name: string
    limit?: number
    balance: number
    minPayment?: number
    apr: number
    dueDate?: number
    installments?: Array<{
      id?: string
      name: string
      total: number
      installments: number
      paid?: number
    }>
  }>
  goals?: Array<{
    id?: string
    name: string
    target: number
    saved?: number
    monthlyContrib?: number
    targetDate?: string | null
    priority?: number
  }>
  assets?: Array<{ id?: string; name: string; value: number; type?: string }>
  variableExpenses?: Array<{
    id?: string
    name: string
    icon?: string
    budget: number
    spent?: number
    categoryId?: string
  }>
  budgetAllocation?: { needs: number; wants: number; savings: number }
  payoffMethod?: 'avalanche' | 'snowball'
}

const ALLOWED_CURRENCIES = new Set(['COP', 'USD', 'CLP', 'MXN', 'ARS', 'BRL', 'PEN'])
const ALLOWED_EXPENSE_CATEGORIES = new Set([
  'housing',
  'utilities',
  'transport',
  'food',
  'health',
  'education',
  'subscriptions',
  'insurance',
  'other',
])
const ALLOWED_ASSET_TYPES = new Set([
  'cash',
  'savings',
  'investment',
  'property',
  'vehicle',
  'other',
])

function ensureId(existing: string | undefined): string {
  if (existing && /^[0-9a-f-]{36}$/i.test(existing)) return existing
  // Use existing non-UUID id as-is for stable migration in tests/fixtures.
  return existing ?? crypto.randomUUID()
}

function nowMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// migrations[2]: v1 → v2 transformation.
function migrateV1toV2(v1: V1State): unknown {
  const currency = ALLOWED_CURRENCIES.has(v1.currency ?? '') ? v1.currency : 'COP'
  const allocation = clampAllocation(v1.budgetAllocation)

  return {
    schemaVersion: 2,
    settings: {
      lang: v1.lang ?? 'es',
      currency,
      theme: 'system',
      payoffMethod: v1.payoffMethod ?? 'avalanche',
      onboarding: { done: true, currentStep: 0 },
      lastMonthSeen: nowMonth(),
    },
    income: {
      grossSalary: v1.income?.grossSalary ?? 0,
      deductions: (v1.income?.deductions ?? []).map((d) => ({
        id: ensureId(d.id),
        label: d.label,
        amount: d.amount,
        type: d.type,
      })),
      otherStreams: (v1.income?.otherStreams ?? []).map((s) => ({
        id: ensureId(s.id),
        label: s.label,
        amount: s.amount,
        frequency: 'monthly' as const,
      })),
      nonSalaryBenefits: [],
    },
    expenses: (v1.expenses ?? []).map((e) => ({
      id: ensureId(e.id),
      name: e.name,
      amount: e.amount,
      category: ALLOWED_EXPENSE_CATEGORIES.has(e.category ?? '') ? e.category : 'other',
    })),
    cards: (v1.cards ?? []).map((c) => ({
      id: ensureId(c.id),
      name: c.name,
      type: 'card' as const,
      limit: c.limit,
      balance: c.balance,
      minPayment: c.minPayment ?? 0,
      apr: c.apr,
      dueDate: c.dueDate ?? 1,
      installmentsList: (c.installments ?? []).map((i) => ({
        id: ensureId(i.id),
        name: i.name,
        total: i.total,
        installments: i.installments,
        paid: i.paid ?? 0,
      })),
    })),
    goals: (v1.goals ?? []).map((g) => ({
      id: ensureId(g.id),
      name: g.name,
      target: g.target,
      saved: g.saved ?? 0,
      monthlyContrib: g.monthlyContrib ?? 0,
      targetDate: g.targetDate ?? null,
      priority: g.priority ?? 0,
    })),
    assets: (v1.assets ?? []).map((a) => ({
      id: ensureId(a.id),
      name: a.name,
      value: a.value,
      type: ALLOWED_ASSET_TYPES.has(a.type ?? '') ? a.type : 'other',
    })),
    variableExpenses: (v1.variableExpenses ?? []).map((v) => ({
      id: ensureId(v.id),
      name: v.name,
      icon: v.icon ?? 'circle',
      budget: v.budget,
      spent: v.spent ?? 0,
    })),
    allocation,
    snapshots: [],
  }
}

function clampAllocation(alloc: V1State['budgetAllocation']): {
  needs: number
  wants: number
  savings: number
} {
  if (!alloc) return { needs: 50, wants: 30, savings: 20 }
  const sum = alloc.needs + alloc.wants + alloc.savings
  if (sum === 100) return alloc
  return { needs: 50, wants: 30, savings: 20 }
}

// migrations[3]: v2 → v3 transformation.
// (a) Asset gets annualRatePercent: 0 default if missing (clamped to [0,100] when present).
// (b) Card.installmentsList → installments rename; Card.dueDate number 1-31 → null (UI
//     enters ISO dates going forward; numeric day-of-month is lossy and not user-shown).
// (c) Legacy "Prima de servicios" stream auto-tagged with isPrima: true and re-ided to
//     reserved slug __prima__ (best-effort: matches label + semiannual + amount within
//     ±5% of grossSalary/2).
// Idempotent: running on v3 input is a no-op.
type V2Like = {
  schemaVersion?: number
  income?: {
    grossSalary?: number
    otherStreams?: Array<{
      id?: string
      label?: string
      amount?: number
      frequency?: string
      isPrima?: boolean
    }>
    [k: string]: unknown
  }
  assets?: Array<{ annualRatePercent?: unknown; [k: string]: unknown }>
  cards?: Array<{
    installmentsList?: unknown
    installments?: unknown
    dueDate?: unknown
    [k: string]: unknown
  }>
  [k: string]: unknown
}

function migrateV2toV3(v2: V2Like): unknown {
  if ((v2.schemaVersion ?? 0) >= 3) return v2

  const grossSalary = v2.income?.grossSalary ?? 0
  const primaTarget = grossSalary / 2

  return {
    ...v2,
    schemaVersion: 3,
    income: {
      ...v2.income,
      otherStreams: (v2.income?.otherStreams ?? []).map((s) => {
        const looksLikePrima =
          s.label === 'Prima de servicios' &&
          s.frequency === 'semiannual' &&
          typeof s.amount === 'number' &&
          primaTarget > 0 &&
          Math.abs(s.amount - primaTarget) / primaTarget < 0.05
        if (looksLikePrima) {
          return { ...s, id: '__prima__', isPrima: true }
        }
        return s
      }),
    },
    assets: (v2.assets ?? []).map((a) => {
      const raw = a.annualRatePercent
      const rate =
        typeof raw === 'number' && Number.isFinite(raw) ? Math.min(100, Math.max(0, raw)) : 0
      return { ...a, annualRatePercent: rate }
    }),
    cards: (v2.cards ?? []).map((c) => {
      const installments = c.installmentsList ?? c.installments ?? []
      // dueDate: legacy number day-of-month is dropped (lossy without calendar context); set to null.
      // Pre-existing string ISO is preserved.
      const dueDate = typeof c.dueDate === 'string' ? c.dueDate : null

      const { installmentsList: _drop, ...rest } = c
      return { ...rest, installments, dueDate }
    }),
  }
}

function migrateV3toV4(v3: AppStateV3): unknown {
  return {
    ...v3,
    schemaVersion: 4,
    settings: {
      ...v3.settings,
      projectionAnnualRatePercent: 0,
    },
    income: {
      ...v3.income,
      otherStreams: v3.income.otherStreams.map((stream) => ({
        ...stream,
        incomeClass: 'linear' as const,
      })),
    },
  }
}

// migrations[5]: v4 → v5 (20260609-dashboard-fintech-redesign, ADR-2). Additive:
// settings.userName defaults to '' and each snapshot gains debtPayments: 0
// (pre-V5 months did not capture the debt obligation; 0 keeps the chart honest).
function migrateV4toV5(v4: AppStateV4): unknown {
  return {
    ...v4,
    schemaVersion: 5,
    settings: {
      ...v4.settings,
      userName: '',
    },
    snapshots: v4.snapshots.map((s) => ({
      ...s,
      debtPayments: (s as { debtPayments?: number }).debtPayments ?? 0,
    })),
  }
}

export const migrations: Record<number, (state: unknown) => unknown> = {
  2: (state: unknown) => migrateV1toV2(state as V1State),
  3: (state: unknown) => migrateV2toV3(state as V2Like),
  4: (state: unknown) => migrateV3toV4(state as AppStateV3),
  5: (state: unknown) => migrateV4toV5(state as AppStateV4),
}

export function migrate(state: unknown): unknown {
  if (typeof state !== 'object' || state === null) return state
  const current = (state as { schemaVersion?: number }).schemaVersion ?? 1
  let s = state
  for (let v = current + 1; v <= 5; v++) {
    const migrator = migrations[v]
    if (migrator) s = migrator(s)
  }
  return s
}
