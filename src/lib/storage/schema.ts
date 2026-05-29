import { z } from 'zod'

// ─── Primitives ──────────────────────────────────────────────────────────
const ID = z.string().uuid()
const Money = z.number().nonnegative().finite()
const Percent01 = z.number().min(0).max(100)
const ISODateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const ISODateTimeString = z.string().datetime()
const YearMonth = z.string().regex(/^\d{4}-\d{2}$/)
const CurrencyCode = z.enum(['COP', 'USD', 'CLP', 'MXN', 'ARS', 'BRL', 'PEN'])
const Lang = z.enum(['es', 'en'])
const Theme = z.enum(['light', 'dark', 'system'])

// ─── Settings ────────────────────────────────────────────────────────────
const SettingsSchema = z.object({
  lang: Lang.default('es'),
  currency: CurrencyCode.default('COP'),
  theme: Theme.default('system'),
  payoffMethod: z.enum(['avalanche', 'snowball']).default('avalanche'),
  onboarding: z
    .object({
      done: z.boolean().default(true),
      currentStep: z.number().int().min(0).max(3).default(0),
    })
    .default({ done: true, currentStep: 0 }),
  lastMonthSeen: YearMonth.nullable().default(null),
})

// ─── Income ──────────────────────────────────────────────────────────────
const DeductionSchema = z.object({
  id: ID,
  label: z.string().min(1).max(60),
  amount: z.number().min(0).finite(),
  type: z.enum(['fixed', 'percent']),
})

const FrequencyEnum = z.enum(['monthly', 'quarterly', 'semiannual', 'annual'])

// IncomeStream id is normally a UUID, but the reserved slug "__prima__" identifies
// the auto-managed prima de servicios entry (ADR-6 in 2-plan.md).
const IncomeStreamIdSchema = z.union([ID, z.literal('__prima__')])

const IncomeStreamSchema = z.object({
  id: IncomeStreamIdSchema,
  label: z.string().min(1).max(60),
  amount: Money,
  frequency: FrequencyEnum.default('monthly'),
  isPrima: z.boolean().optional(),
})

const NonSalaryBenefitSchema = z.object({
  id: ID,
  label: z.string().min(1).max(60),
  amount: Money,
})

const IncomeSchema = z.object({
  grossSalary: Money.default(0),
  deductions: z.array(DeductionSchema).default([]),
  otherStreams: z.array(IncomeStreamSchema).default([]),
  nonSalaryBenefits: z.array(NonSalaryBenefitSchema).default([]),
})

// ─── Fixed expenses ──────────────────────────────────────────────────────
// Includes Spanish-localized 'vivienda' so user-entered categories from ExpenseForm.vue
// (default value) round-trip cleanly. The lib filter for housing ratio also uses 'vivienda'.
const ExpenseCategoryEnum = z.enum([
  'vivienda',
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

const FixedExpenseSchema = z.object({
  id: ID,
  name: z.string().min(1).max(60),
  amount: Money,
  category: ExpenseCategoryEnum,
})

// ─── Cards / Loans (discriminated union) ─────────────────────────────────
// V3 alignment: dueDate accepts ISO date string OR null (matches UI form input).
// installments field name matches cardsStore (was installmentsList in v2 schema).
const InstallmentSchema = z.object({
  id: ID,
  name: z.string().min(1).max(60),
  total: Money,
  installments: z.number().int().min(1).max(72),
  paid: z.number().int().min(0).default(0),
})

const CardCommonSchema = z.object({
  id: ID,
  name: z.string().min(1).max(60),
  limit: Money.optional(),
  balance: Money,
  minPayment: Money.default(0),
  apr: z.number().min(0).max(200).finite(),
  installments: z.array(InstallmentSchema).default([]),
})

const CardSchema = z.discriminatedUnion('type', [
  CardCommonSchema.extend({
    type: z.literal('card'),
    dueDate: ISODateString.nullable().default(null),
  }),
  CardCommonSchema.extend({
    type: z.literal('loan'),
    remainingInstallments: z.number().int().min(0).max(360),
  }),
])

// ─── Goals ───────────────────────────────────────────────────────────────
const GoalSchema = z.object({
  id: ID,
  name: z.string().min(1).max(60),
  target: Money,
  saved: Money.default(0),
  monthlyContrib: Money.default(0),
  targetDate: ISODateString.nullable().default(null),
  priority: z.number().int().min(0).default(0),
})

// ─── Assets ──────────────────────────────────────────────────────────────
const AssetTypeEnum = z.enum(['cash', 'savings', 'investment', 'property', 'vehicle', 'other'])

// annualRatePercent is the per-asset annual rate (TEA, %) used by the compound
// growth projection (US-8 AC-8.2). Range [0, 100]; defaults to 0 when omitted.
const AssetSchema = z.object({
  id: ID,
  name: z.string().min(1).max(60),
  value: Money,
  type: AssetTypeEnum,
  annualRatePercent: z.number().min(0).max(100).finite().default(0),
})

// ─── Variable expenses ───────────────────────────────────────────────────
const VariableCategorySchema = z.object({
  id: ID,
  name: z.string().min(1).max(60),
  icon: z.string().min(1).max(40),
  budget: Money,
  spent: Money.default(0),
})

// ─── Allocation (refinement: sum must equal 100) ─────────────────────────
const AllocationSchema = z
  .object({
    needs: Percent01.default(50),
    wants: Percent01.default(30),
    savings: Percent01.default(20),
  })
  .refine((a) => a.needs + a.wants + a.savings === 100, {
    message: 'allocation.sumMustBe100',
    path: ['savings'],
  })

// ─── Snapshots ───────────────────────────────────────────────────────────
const SnapshotSchema = z.object({
  id: ID,
  month: YearMonth,
  capturedAt: ISODateTimeString,
  netIncome: Money,
  totalFixedExpenses: Money,
  totalVariableSpent: Money,
  totalDebt: Money,
  dti: z.number().min(0).max(1000).finite(),
  savingsRate: z.number().finite(),
  netWorth: z.number().finite(),
  healthScore: z.number().min(0).max(100).nullable(),
})

// ─── V2 legacy shapes (used by AppStateSchemaV2 only) ────────────────────
// Kept for migrate.ts: v1→v2 output uses installmentsList + dueDate as number 1–31,
// no annualRatePercent on Asset, no isPrima on IncomeStream. V2 is the migration
// target shape; once T-016 adds v2→v3 migration, this all flows into V3.

const IncomeStreamSchemaV2 = z.object({
  id: ID,
  label: z.string().min(1).max(60),
  amount: Money,
  frequency: FrequencyEnum.default('monthly'),
})

const IncomeSchemaV2 = z.object({
  grossSalary: Money.default(0),
  deductions: z.array(DeductionSchema).default([]),
  otherStreams: z.array(IncomeStreamSchemaV2).default([]),
  nonSalaryBenefits: z.array(NonSalaryBenefitSchema).default([]),
})

const AssetSchemaV2 = z.object({
  id: ID,
  name: z.string().min(1).max(60),
  value: Money,
  type: AssetTypeEnum,
})

const ExpenseCategoryEnumV2 = z.enum([
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

const FixedExpenseSchemaV2 = z.object({
  id: ID,
  name: z.string().min(1).max(60),
  amount: Money,
  category: ExpenseCategoryEnumV2,
})

const CardCommonSchemaV2 = z.object({
  id: ID,
  name: z.string().min(1).max(60),
  limit: Money.optional(),
  balance: Money,
  minPayment: Money.default(0),
  apr: z.number().min(0).max(200).finite(),
  installmentsList: z.array(InstallmentSchema).default([]),
})

const CardSchemaV2 = z.discriminatedUnion('type', [
  CardCommonSchemaV2.extend({
    type: z.literal('card'),
    dueDate: z.number().int().min(1).max(31),
  }),
  CardCommonSchemaV2.extend({
    type: z.literal('loan'),
    remainingInstallments: z.number().int().min(0).max(360),
  }),
])

// ─── Root ────────────────────────────────────────────────────────────────
// V2 is kept as a migration target only (consumed by lib/storage/migrate.ts).
// Active app code reads/writes V3.
export const AppStateSchemaV2 = z.object({
  schemaVersion: z.literal(2),
  settings: SettingsSchema,
  income: IncomeSchemaV2,
  expenses: z.array(FixedExpenseSchemaV2).default([]),
  cards: z.array(CardSchemaV2).default([]),
  goals: z.array(GoalSchema).default([]),
  assets: z.array(AssetSchemaV2).default([]),
  variableExpenses: z.array(VariableCategorySchema).default([]),
  allocation: AllocationSchema,
  snapshots: z.array(SnapshotSchema).default([]),
})

// V3 is the active schema for saveAppState / loadAppState.
// Adds annualRatePercent on Asset, isPrima on IncomeStream, relaxed card.dueDate
// to ISO string, and Spanish-localized 'vivienda' category. See 2-data-model.md.
export const AppStateSchemaV3 = z.object({
  schemaVersion: z.literal(3),
  settings: SettingsSchema,
  income: IncomeSchema,
  expenses: z.array(FixedExpenseSchema).default([]),
  cards: z.array(CardSchema).default([]),
  goals: z.array(GoalSchema).default([]),
  assets: z.array(AssetSchema).default([]),
  variableExpenses: z.array(VariableCategorySchema).default([]),
  allocation: AllocationSchema,
  snapshots: z.array(SnapshotSchema).default([]),
})

export type AppStateV2 = z.infer<typeof AppStateSchemaV2>
export type AppStateV3 = z.infer<typeof AppStateSchemaV3>
export type Deduction = z.infer<typeof DeductionSchema>
export type IncomeStream = z.infer<typeof IncomeStreamSchema>
export type FixedExpense = z.infer<typeof FixedExpenseSchema>
export type Card = z.infer<typeof CardSchema>
export type Installment = z.infer<typeof InstallmentSchema>
export type Goal = z.infer<typeof GoalSchema>
export type Asset = z.infer<typeof AssetSchema>
export type VariableCategory = z.infer<typeof VariableCategorySchema>
export type Snapshot = z.infer<typeof SnapshotSchema>
export type Settings = z.infer<typeof SettingsSchema>
