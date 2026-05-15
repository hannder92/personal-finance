// v1 → v2 migration per `specs/20260514-project-refactor/2-data-model.md`.
// Uses a versioned chain (ADR-4): each migrations[N] transforms (N-1) → N in isolation.

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

function hasAnyData(v1: V1State): boolean {
  const grossSalary = v1.income?.grossSalary ?? 0
  return (
    grossSalary > 0 ||
    (v1.income?.deductions?.length ?? 0) > 0 ||
    (v1.income?.otherStreams?.length ?? 0) > 0 ||
    (v1.expenses?.length ?? 0) > 0 ||
    (v1.cards?.length ?? 0) > 0 ||
    (v1.goals?.length ?? 0) > 0 ||
    (v1.assets?.length ?? 0) > 0 ||
    (v1.variableExpenses?.length ?? 0) > 0
  )
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
      onboarding: { done: hasAnyData(v1), currentStep: hasAnyData(v1) ? 3 : 0 },
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

export const migrations: Record<number, (state: unknown) => unknown> = {
  2: (state: unknown) => migrateV1toV2(state as V1State),
}

export function migrate(state: unknown): unknown {
  if (typeof state !== 'object' || state === null) return state
  const current = (state as { schemaVersion?: number }).schemaVersion ?? 1
  let s = state
  for (let v = current + 1; v <= 2; v++) {
    const migrator = migrations[v]
    if (migrator) s = migrator(s)
  }
  return s
}
